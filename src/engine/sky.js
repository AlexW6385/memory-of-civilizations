// Forked from three.js examples/jsm/objects/SkyMesh.js (MIT, © 2010-2025 three.js authors): adds
// `horizonDip`, so that the sky's horizon follows the dipped horizon of a small planet, and `haze`,
// a veil of the weather's haze over the sky (dust, mist, fog: src/planet/setpieces.js).
import {
	BackSide,
	BoxGeometry,
	Mesh,
	Vector3,
	NodeMaterial
} from 'three/webgpu';

import { Fn, float, floor, fract, vec2, vec3, acos, asin, sin, add, mul, clamp, cos, dot, exp, max, min, mix, modelViewProjection, normalize, positionWorld, pow, smoothstep, sub, varyingProperty, vec4, uniform, cameraPosition, time, If, Loop } from 'three/tsl';
import { ENV } from './env.js';

/**
 * Represents a skydome for scene backgrounds. Based on [A Practical Analytic Model for Daylight](https://www.researchgate.net/publication/220720443_A_Practical_Analytic_Model_for_Daylight)
 * aka The Preetham Model, the de facto standard for analytical skydomes.
 *
 * Note that this class can only be used with {@link WebGPURenderer}.
 * When using {@link WebGLRenderer}, use {@link Sky}.
 *
 * More references:
 *
 * - {@link http://simonwallner.at/project/atmospheric-scattering/}
 * - {@link http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR}
 *
 * ```js
 * const sky = new SkyMesh();
 * sky.scale.setScalar( 10000 );
 * scene.add( sky );
 * ```
 *
 * It can be useful to hide the sun disc when generating an environment map to avoid artifacts
 *
 * ```js
 * // disable before rendering environment map
 * sky.showSunDisc.value = false;
 * // ...
 * // re-enable before scene sky box rendering
 * sky.showSunDisc.value = true;
 * ```
 *
 * @augments Mesh
 * @three_import import { SkyMesh } from 'three/addons/objects/SkyMesh.js';
 */
class SkyMesh extends Mesh {

	/**
	 * Constructs a new skydome.
	 */
	constructor() {

		const material = new NodeMaterial();

		super( new BoxGeometry( 1, 1, 1 ), material );

		/**
		 * The turbidity uniform.
		 *
		 * @type {UniformNode<float>}
		 */
		this.turbidity = uniform( 2 );

		/**
		 * The rayleigh uniform.
		 *
		 * @type {UniformNode<float>}
		 */
		this.rayleigh = uniform( 1 );

		/**
		 * The mieCoefficient uniform.
		 *
		 * @type {UniformNode<float>}
		 */
		this.mieCoefficient = uniform( 0.005 );

		/**
		 * The mieDirectionalG uniform.
		 *
		 * @type {UniformNode<float>}
		 */
		this.mieDirectionalG = uniform( 0.8 );

		/**
		 * The sun position uniform.
		 *
		 * @type {UniformNode<vec3>}
		 */
		this.sunPosition = uniform( new Vector3() );

		/**
		 * The cloud scale uniform.
		 *
		 * @type {UniformNode<float>}
		 */
		this.cloudScale = uniform( 0.0002 );

		/**
		 * The cloud speed uniform.
		 *
		 * @type {UniformNode<float>}
		 */
		this.cloudSpeed = uniform( 0.00002 );

		/**
		 * The cloud coverage uniform.
		 *
		 * @type {UniformNode<float>}
		 */
		this.cloudCoverage = uniform( 0.4 );

		/**
		 * The cloud density uniform.
		 *
		 * @type {UniformNode<float>}
		 */
		this.cloudDensity = uniform( 0.4 );

		/**
		 * The cloud elevation uniform.
		 *
		 * @type {UniformNode<float>}
		 */
		this.cloudElevation = uniform( 0.5 );

		/**
		 * Whether to render the solar disc.
		 *
		 * @type {UniformNode<float>}
		 */
		this.showSunDisc = uniform( 1 );

		/**
		 * How far the true horizon lies below the level (radians): on a small planet, seen from a
		 * height, the horizon dips; the sky's bright band follows it (Memory of Civilizations).
		 *
		 * @type {UniformNode<float>}
		 */
		this.horizonDip = uniform( 0 );

		/**
		 * How much the weather's haze (ENV.fogColor) veils the sky: 0 none … 1 the sky lost in it.
		 *
		 * @type {UniformNode<float>}
		 */
		this.haze = uniform( 0 );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 * @deprecated Use isSkyMesh instead.
		 */
		this.isSky = true; // @deprecated, r182

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSkyMesh = true;

		// Varyings

		const vSunDirection = varyingProperty( 'vec3' );
		const vSunE = varyingProperty( 'float' );
		const vBetaR = varyingProperty( 'vec3' );
		const vBetaM = varyingProperty( 'vec3' );

		const vertexNode = /*@__PURE__*/ Fn( () => {

			// constants for atmospheric scattering
			const e = float( 2.718281828459045 );
			// const pi = float( 3.141592653589793 );

			// wavelength of used primaries, according to preetham
			// const lambda = vec3( 680E-9, 550E-9, 450E-9 );
			// this pre-calculation replaces older TotalRayleigh(vec3 lambda) function:
			// (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
			const totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

			// mie stuff
			// K coefficient for the primaries
			// const v = float( 4.0 );
			// const K = vec3( 0.686, 0.678, 0.666 );
			// MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
			const MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );

			// earth shadow hack
			// cutoffAngle = pi / 1.95;
			const cutoffAngle = float( 1.6110731556870734 );
			const steepness = float( 1.5 );
			const EE = float( 1000.0 );

			// varying sun position

			const sunDirection = normalize( this.sunPosition );
			vSunDirection.assign( sunDirection );

			// varying sun intensity

			const angle = sunDirection.y;
			const zenithAngleCos = clamp( angle, - 1, 1 );
			const sunIntensity = EE.mul( max( 0.0, float( 1.0 ).sub( pow( e, cutoffAngle.sub( acos( zenithAngleCos ) ).div( steepness ).negate() ) ) ) );
			vSunE.assign( sunIntensity );

			// sun fade

			const sunfade = float( 1.0 ).sub( clamp( float( 1.0 ).sub( exp( this.sunPosition.y.div( 450000.0 ) ) ), 0, 1 ) );

			// varying vBetaR

			const rayleighCoefficient = this.rayleigh.sub( float( 1.0 ).mul( float( 1.0 ).sub( sunfade ) ) );

			// extinction (absorption + out scattering)
			// rayleigh coefficients
			vBetaR.assign( totalRayleigh.mul( rayleighCoefficient ) );

			// varying vBetaM

			const c = float( 0.2 ).mul( this.turbidity ).mul( 10E-18 );
			const totalMie = float( 0.434 ).mul( c ).mul( MieConst );

			vBetaM.assign( totalMie.mul( this.mieCoefficient ) );

			// position

			const position = modelViewProjection;
			// on the far plane: z = w in a standard depth buffer, z = 0 in a reversed one (where z = w
			// is the near plane, and the sky drew over whatever was drawn before it)
			position.z.assign( position.w.mul( SKY_FAR ) );

			return position;

		} )();

		const colorNode = /*@__PURE__*/ Fn( () => {

			// constants for atmospheric scattering
			const pi = float( 3.141592653589793 );

			// optical length at zenith for molecules
			const rayleighZenithLength = float( 8.4E3 );
			const mieZenithLength = float( 1.25E3 );
			// 66 arc seconds -> degrees, and the cosine of that
			const sunAngularDiameterCos = float( 0.9999566769464484 );

			// 3.0 / ( 16.0 * pi )
			const THREE_OVER_SIXTEENPI = float( 0.05968310365946075 );
			// 1.0 / ( 4.0 * pi )
			const ONE_OVER_FOURPI = float( 0.07957747154594767 );

			//

			const rawDirection = normalize( positionWorld.sub( cameraPosition ) );
			// elevation measured from the dipped horizon (see horizonDip)
			const elevation0 = asin( clamp( rawDirection.y, - 1, 1 ) ).add( this.horizonDip );
			const flat = normalize( vec2( rawDirection.x, rawDirection.z ).add( vec2( 1e-6, 0 ) ) );
			const direction = vec3( flat.x.mul( cos( elevation0 ) ), sin( elevation0 ), flat.y.mul( cos( elevation0 ) ) ).toVar();

			// optical length
			// cutoff angle at 90 to avoid singularity in next formula.
			const zenithAngle = acos( max( 0.0, direction.y ) );
			const inverse = float( 1.0 ).div( cos( zenithAngle ).add( float( 0.15 ).mul( pow( float( 93.885 ).sub( zenithAngle.mul( 180.0 ).div( pi ) ), - 1.253 ) ) ) );
			const sR = rayleighZenithLength.mul( inverse );
			const sM = mieZenithLength.mul( inverse );

			// combined extinction factor
			const Fex = exp( mul( vBetaR, sR ).add( mul( vBetaM, sM ) ).negate() );

			// in scattering
			const cosTheta = dot( direction, vSunDirection );

			// betaRTheta

			const c = cosTheta.mul( 0.5 ).add( 0.5 );
			const rPhase = THREE_OVER_SIXTEENPI.mul( float( 1.0 ).add( pow( c, 2.0 ) ) );
			const betaRTheta = vBetaR.mul( rPhase );

			// betaMTheta

			const g2 = pow( this.mieDirectionalG, 2.0 );
			const inv = float( 1.0 ).div( pow( float( 1.0 ).sub( float( 2.0 ).mul( this.mieDirectionalG ).mul( cosTheta ) ).add( g2 ), 1.5 ) );
			const mPhase = ONE_OVER_FOURPI.mul( float( 1.0 ).sub( g2 ) ).mul( inv );
			const betaMTheta = vBetaM.mul( mPhase );

			const Lin = pow( vSunE.mul( add( betaRTheta, betaMTheta ).div( add( vBetaR, vBetaM ) ) ).mul( sub( 1.0, Fex ) ), vec3( 1.5 ) );
			Lin.mulAssign( mix( vec3( 1.0 ), pow( vSunE.mul( add( betaRTheta, betaMTheta ).div( add( vBetaR, vBetaM ) ) ).mul( Fex ), vec3( 1.0 / 2.0 ) ), clamp( pow( sub( 1.0, vSunDirection.y ), 5.0 ), 0.0, 1.0 ) ) );

			// nightsky

			const L0 = vec3( 0.1 ).mul( Fex );

			// composition + solar disc
			const sundisc = clamp( cosTheta.sub( sunAngularDiameterCos ).mul( 50000.0 ), 0.0, 1.0 ).mul( this.showSunDisc );
			const sundiscColor = min( vSunE.mul( Fex ), 80.0 ).mul( 760.0 ).mul( sundisc );

			const texColor = add( Lin, L0 ).mul( 0.04 ).add( sundiscColor ).add( vec3( 0.0, 0.0003, 0.00075 ) ).toVar();

			// gradient at a lattice corner; sinless hash so every GPU produces the same clouds
			const gradient = Fn( ( [ i ] ) => {

				const p = fract( i.xyx.mul( vec3( 0.1031, 0.1030, 0.0973 ) ) ).toVar();
				p.addAssign( dot( p, p.yzx.add( 33.33 ) ) );

				return fract( p.xx.add( p.yz ).mul( p.zy ) ).mul( 2.0 ).sub( 1.0 );

			} );

			// 2D gradient noise: isotropic lobes like Perlin at value-noise cost
			const noise = Fn( ( [ p ] ) => {

				const i = floor( p );
				const f = fract( p );
				const u = f.mul( f ).mul( f ).mul( f.mul( f.mul( 6.0 ).sub( 15.0 ) ).add( 10.0 ) ); // quintic fade

				const a = dot( gradient( i ), f );
				const b = dot( gradient( i.add( vec2( 1.0, 0.0 ) ) ), f.sub( vec2( 1.0, 0.0 ) ) );
				const c = dot( gradient( i.add( vec2( 0.0, 1.0 ) ) ), f.sub( vec2( 0.0, 1.0 ) ) );
				const d = dot( gradient( i.add( vec2( 1.0, 1.0 ) ) ), f.sub( vec2( 1.0, 1.0 ) ) );

				return mix( mix( a, b, u.x ), mix( c, d, u.x ), u.y ).mul( 1.6 ); // ~[-1,1]

			} );

			// fbm; per-octave drift makes clouds billow instead of scrolling as a rigid stamp
			const fbm = Fn( ( [ position, drift ] ) => {

				const p = vec2( position ).toVar();
				const result = float( 0.0 ).toVar();
				const amplitude = float( 1.0 ).toVar();

				Loop( 4, () => {

					result.addAssign( amplitude.mul( noise( p ) ) );
					amplitude.mulAssign( 0.5 );
					p.mulAssign( 2.0 ).addAssign( drift );

				} );

				return result;

			} );

			// Clouds (DESIGN §4.3): three layers by the weather (src/engine/climate.js) — high cirrus
			// streaks (ENV.cirrus), the mid cumulus field (cloudCoverage, cloudDensity), a dark low deck in
			// overcast and rain (ENV.deck) — lit by the sun through the air along its own path (white at
			// noon, gold and rose low), shadowed by their density toward the sun (one or two samples),
			// silver-lined near the sun, blue-grey in the twilight, faintly moonlit at night, and lit from
			// inside by lightning (ENV.flash, toward ENV.flashDir)
			const luma3 = vec3( 0.2126, 0.7152, 0.0722 );
			const sunY = vSunDirection.y;

			// the sun's light at the clouds: its extinction along its own path, capped (the clouds stand
			// high, above most of the air a low sun shines through)
			const sunZen = acos( clamp( sunY, 0.0, 1.0 ) );
			const invS = float( 1.0 ).div( cos( sunZen ).add( float( 0.15 ).mul( pow( float( 93.885 ).sub( sunZen.mul( 180.0 ).div( pi ) ), - 1.253 ) ) ) ).min( 14.0 );
			const FexSun = exp( mul( vBetaR, rayleighZenithLength.mul( invS ) ).add( mul( vBetaM, mieZenithLength.mul( invS ) ) ).negate() );
			const sunLight = vSunE.mul( FexSun ).mul( 0.22 * 0.04 ).toVar(); // 0.22 ~ albedo/pi, 0.04 = exposure
			// the sky's light on them, greyed (clouds take the whole sky's light, not the blue overhead alone)
			const skyAmb0 = Lin.mul( 0.04 ).add( vec3( 0.0, 0.0003, 0.00075 ) );
			const skyAmbient = mix( skyAmb0, vec3( dot( skyAmb0, luma3 ) ), 0.45 ).mul( smoothstep( - 0.08, 0.3, sunY ).mul( 0.85 ).add( 0.15 ) ).toVar();
			// a low sun lights the clouds from below (their bases gold and rose); after it has set, the
			// twilight leaves them blue-grey; at night the moon silvers them faintly
			const lowSun = sub( 1.0, smoothstep( 0.02, 0.22, sunY ) ).mul( smoothstep( - 0.045, 0.0, sunY ) );
			const twilight = smoothstep( - 0.2, - 0.03, sunY ).mul( sub( 1.0, smoothstep( - 0.03, 0.06, sunY ) ) );
			const moonK = ENV.moonUp.mul( smoothstep( 0.3, 0.8, ENV.night ) );
			const moonCos = dot( direction, ENV.moonDir );
			const nightLight = vec3( 0.018, 0.022, 0.034 ).mul( twilight ).add( vec3( 0.55, 0.64, 0.9 ).mul( moonK ).mul( 0.03 ) ).toVar();
			const moonRim = vec3( 0.55, 0.64, 0.9 ).mul( moonK ).mul( 0.01 ).mul( float( 0.51 ).div( pow( sub( 1.49, moonCos.mul( 1.4 ) ), 1.5 ) ).min( 3.0 ) );
			// lightning: the clouds lit from inside, most round the stroke
			const flatDir = normalize( direction.xz.add( vec2( 1e-5, 0.0 ) ) );
			const flashLocal = ENV.flash.mul( float( 0.3 ).add( exp( dot( flatDir, ENV.flashDir.xz ).sub( 1.0 ).mul( 5.0 ) ).mul( 0.7 ) ) );
			const flashCol = vec3( 0.78, 0.84, 1.0 ).mul( flashLocal ).mul( 1.2 ).toVar();
			// Henyey-Greenstein forward lobe ( g = 0.7 ): silver lining on rims toward the sun
			const silver = float( 0.51 ).div( pow( sub( 1.49, cosTheta.mul( 1.4 ) ), 1.5 ) ).clamp( 0.0, 3.0 ); // 0.51=1-g^2, 1.49=1+g^2, 1.4=2g
			const drift = time.mul( this.cloudSpeed );

			// high cirrus: thin streaks of ice far up, drawn out along the wind, lit nearly white,
			// glowing longest after sunset
			If( direction.y.greaterThan( 0.0 ).and( ENV.cirrus.greaterThan( 0.01 ) ), () => {

				const pc = direction.xz.div( direction.y.mul( 0.6 ).add( 0.02 ) ).mul( 0.32 ).add( drift.mul( 140.0 ) );
				const q = vec2( pc.x.mul( 0.8 ).add( pc.y.mul( 0.6 ) ), pc.y.mul( 0.8 ).sub( pc.x.mul( 0.6 ) ) );
				const n = noise( vec2( q.x.mul( 0.45 ), q.y.mul( 3.2 ) ) ).mul( 0.65 ).add( noise( vec2( q.x.mul( 1.3 ), q.y.mul( 9.0 ) ).add( drift.mul( 90.0 ) ) ).mul( 0.35 ) );
				const mask = smoothstep( 0.62, 0.98, n.mul( 0.5 ).add( 0.5 ).add( ENV.cirrus.mul( 0.32 ) ) ).mul( ENV.cirrus ).mul( smoothstep( 0.0, 0.12, direction.y ) );
				const col = sunLight.mul( float( 0.7 ).add( silver.mul( 0.35 ) ) ).add( skyAmbient.mul( 0.9 ) ).add( nightLight ).add( moonRim );
				const a = mask.mul( 0.5 ).toVar();
				texColor.assign( mix( texColor, mix( texColor, col, Fex ), a ) );

			} );

			// mid cumulus: the field of heaps, bright on the sun's side and grey at their bases
			If( direction.y.greaterThan( 0.0 ).and( this.cloudCoverage.greaterThan( 0.0 ) ), () => {

				// Project to cloud plane (higher elevation = clouds appear lower/closer)
				const elevation = mix( 1.0, 0.1, this.cloudElevation );
				const cloudUV = direction.xz.div( direction.y.mul( elevation ) ).toVar();
				cloudUV.mulAssign( this.cloudScale );
				cloudUV.addAssign( drift );

				// Cloud density field
				const evolve = drift.mul( 300.0 );
				const P = cloudUV.mul( 1500.0 ).toVar(); // heaps smaller than the old single layer's banks
				const cloudNoise = fbm( P, evolve ).mul( 0.7 ).add( 0.5 ).clamp( 0.0, 1.0 ).toVar();

				// Large-scale coverage variation: clear gaps next to dense banks
				const region = noise( cloudUV.mul( 300.0 ) ).mul( 0.37 ).add( 0.5 );
				const cov = clamp( this.cloudCoverage.add( region.sub( 0.5 ).mul( 0.6 ) ), 0.0, 1.0 );

				// Carve clouds where noise rises above the coverage level
				const threshold = sub( 1.0, cov ).toVar();
				const cloudMask = smoothstep( threshold, threshold.add( 0.16 ), cloudNoise ).toVar();

				// Fade clouds near horizon (adjusted by elevation)
				const horizonFade = smoothstep( 0.0, add( 0.03, mul( 0.06, this.cloudElevation ) ), direction.y );
				cloudMask.mulAssign( horizonFade );

				const depth = max( 0.0, cloudNoise.sub( threshold ) ).toVar();

				// self-shadow: the density a step and (above the low preset) two steps toward the sun,
				// the coarse octaves only; with the sun high the step shrinks to the cloud's own thickness
				const sxz = vSunDirection.xz;
				const reach = sxz.length().div( max( sunY, 0.12 ) ).mul( 0.11 ).min( 0.6 );
				const toSun = normalize( sxz.add( vec2( 1e-5, 0.0 ) ) ).mul( reach ).add( vec2( 0.0, 0.08 ) );
				const coarse = ( p ) => noise( p ).add( noise( p.mul( 2.0 ).add( evolve ) ).mul( 0.5 ) ).mul( 0.7 ).add( 0.5 );
				const od = max( 0.0, coarse( P.add( toSun ) ).sub( threshold ) ).mul( 1.6 ).toVar();
				If( ENV.cloudDetail.greaterThan( 0.5 ), () => {

					od.assign( od.mul( 0.62 ).add( max( 0.0, coarse( P.add( toSun.mul( 2.3 ) ) ).sub( threshold ) ).mul( 0.9 ) ) );

				} );
				const k = this.cloudDensity.mul( 3.0 ).add( 1.5 );
				const toward = exp( od.add( depth.mul( 0.5 ) ).mul( k ).negate() );
				// Beer-powder: the thin edges dark-rimmed against the light, the body lit through
				const powder = sub( 1.0, exp( depth.mul( - 10.0 ) ) ).mul( 0.5 ).add( 0.5 );
				const lit = toward.mul( powder ).mul( 1.5 ).clamp( 0.0, 1.0 );
				// the bases grey: the thicker the heap above, the less of the sky's light under it
				const base = mix( 1.15, 0.6, smoothstep( 0.0, 0.35, depth ).mul( this.cloudDensity.mul( 0.6 ).add( 0.4 ) ) );
				const edge = cloudMask.mul( sub( 1.0, cloudMask ) ).mul( 4.0 );

				const cloudColor = skyAmbient.mul( base ).add( sunLight.mul( lit ) ).toVar();
				cloudColor.addAssign( sunLight.mul( silver ).mul( edge ).mul( 0.6 ) );
				// lit from below by a low sun: the undersides gold and rose, whatever stands above them
				cloudColor.addAssign( sunLight.mul( lowSun ).mul( 0.45 ).mul( sub( 1.0, lit ) ) );
				cloudColor.addAssign( nightLight.mul( base ).add( moonRim.mul( edge ) ) );
				cloudColor.addAssign( flashCol.mul( smoothstep( 0.0, 0.3, depth ).mul( 0.8 ).add( 0.2 ) ) );

				// Cloud opacity via Beer's law: density sets how solid the clouds get
				const alpha = sub( 1.0, exp( depth.mul( this.cloudDensity ).mul( - 20.0 ) ) ).mul( horizonFade ).toVar();

				// Occlude the sun disc/glow behind opaque cloud
				texColor.subAssign( L0.mul( 0.04 ).add( sundiscColor ).mul( alpha ) );

				// Composite through the atmosphere so distant clouds dissolve into haze
				const cloudAerial = mix( texColor, cloudColor, Fex );
				texColor.assign( mix( texColor, cloudAerial, alpha ) );

			} );

			// the low deck: a grey ceiling in overcast, dark and ragged in rain and storm, pale in snow;
			// it reaches down to the horizon and hides the sun
			If( direction.y.greaterThan( - 0.02 ).and( ENV.deck.greaterThan( 0.01 ) ), () => {

				const pd = direction.xz.div( direction.y.max( 0.0 ).add( 0.035 ) ).mul( 0.34 ).add( drift.mul( 260.0 ) ).toVar();
				const n = noise( pd ).mul( 0.6 ).add( noise( pd.mul( 2.7 ).add( drift.mul( 500.0 ) ) ).mul( 0.3 ) ).toVar();
				If( ENV.cloudDetail.greaterThan( 0.5 ), () => {

					n.addAssign( noise( pd.mul( 7.3 ).sub( drift.mul( 900.0 ) ) ).mul( 0.14 ) );

				} );
				const v = n.mul( 0.5 ).add( 0.5 );
				const mask = smoothstep( 0.0, 0.3, v.add( ENV.deck.mul( 1.25 ) ).sub( 0.95 ) ).mul( ENV.deck.mul( 1.2 ).min( 1.0 ) ).mul( smoothstep( - 0.02, 0.05, direction.y ) );
				// tone: the thick and the thin of the deck, rolls and ragged scud under it
				const tone = smoothstep( 0.2, 0.8, v );
				const dark = sub( 1.0, ENV.rain.min( 1.0 ).mul( 0.6 ) ).sub( ENV.storm.mul( 0.2 ) ).mul( mix( 1.0, 1.9, ENV.snow ) );
				const grey = vec3( dot( skyAmb0, luma3 ) ).mul( vec3( 0.95, 0.97, 1.0 ) ).mul( 1.1 ).add( sunLight.mul( 0.07 ) );
				const col = grey.mul( mix( 0.3, 0.95, tone ) ).mul( dark ).toVar();
				col.addAssign( sunLight.mul( lowSun ).mul( 0.35 ).mul( tone ) );
				col.addAssign( nightLight.mul( mix( 0.5, 0.9, tone ) ) );
				col.addAssign( flashCol.mul( mix( 0.55, 1.1, tone ) ) );
				const a = mask.toVar();
				texColor.subAssign( sundiscColor.mul( a ) );
				// toward the horizon the deck goes grey into the rain and haze (no clear sky under it)
				const far = vec3( dot( texColor, luma3 ) ).mul( dark.mul( 0.5 ).add( 0.35 ) );
				texColor.assign( mix( texColor, mix( far, col, smoothstep( 0.0, 0.3, direction.y ) ), a ) );

			} );

			// a rainbow opposite a low sun, on the rain (ENV.rainbow: rain falling or just past, the sun
			// out): the primary at 40.6–42.4° from the antisolar point (red outside), the fainter
			// secondary at 50–53.5° (reversed), the sky brighter inside the bow and darker between them
			If( ENV.rainbow.greaterThan( 0.001 ), () => {

				const th = acos( clamp( cosTheta.negate(), - 1.0, 1.0 ) ).mul( 57.29578 );
				const hue = ( h ) => clamp( fract( vec3( h ).add( vec3( 1.0, 0.6667, 0.3333 ) ) ).mul( 6.0 ).sub( 3.0 ).abs().sub( 1.0 ), 0.0, 1.0 );
				const t1 = th.sub( 40.6 ).div( 1.8 ), t2 = th.sub( 50.2 ).div( 3.3 );
				const e1 = smoothstep( 0.0, 0.25, t1 ).mul( sub( 1.0, smoothstep( 0.75, 1.0, t1 ) ) );
				const e2 = smoothstep( 0.0, 0.25, t2 ).mul( sub( 1.0, smoothstep( 0.75, 1.0, t2 ) ) ).mul( 0.38 );
				const bow = hue( mix( 0.76, 0.0, t1.clamp( 0.0, 1.0 ) ) ).mul( e1 ).add( hue( mix( 0.0, 0.76, t2.clamp( 0.0, 1.0 ) ) ).mul( e2 ) );
				const inside = sub( 1.0, smoothstep( 37.0, 41.0, th ) ).mul( smoothstep( 15.0, 37.0, th ) ).mul( 0.12 );
				const between = smoothstep( 42.2, 43.5, th ).mul( sub( 1.0, smoothstep( 49.0, 50.4, th ) ) ).mul( 0.12 );
				const bright = dot( texColor, luma3 ).mul( 0.55 ).add( dot( sunLight, luma3 ).mul( 0.05 ) );
				const k = ENV.rainbow.mul( smoothstep( - 0.01, 0.06, direction.y ) );
				texColor.assign( texColor.mul( sub( 1.0, between.mul( k ) ) ).add( bow.mul( bright ).mul( k ) ).add( vec3( bright ).mul( inside ).mul( k ) ) );

			} );

			// the weather's haze over the sky: lit as an overcast cloud is (the sky's light and the sun's
			// through the air), in the haze's colour, thickest toward the horizon; the sun a pale disc in it
			If( this.haze.greaterThan( 0.001 ), () => {

				const luma = vec3( 0.2126, 0.7152, 0.0722 );
				const lit = dot( Lin.mul( 0.04 ), luma ).min( 4.0 ).mul( 0.6 ).add( dot( vSunE.mul( Fex ).mul( 0.22 * 0.04 ), luma ).min( 4.0 ).mul( 0.55 ) );
				// (the hue deepened: the bright sky is desaturated by the tone mapping more than the ground)
				const hue = ENV.fogColor.mul( ENV.fogColor );
				const veil = hue.div( dot( hue, luma ).max( 0.01 ) ).mul( lit );
				const k = this.haze.mul( mix( 1.0, 0.75, clamp( direction.y, 0.0, 1.0 ) ) );
				const disc = clamp( cosTheta.sub( 0.99985 ).mul( 6000.0 ), 0.0, 1.0 ).mul( this.showSunDisc ).mul( this.haze ).mul( lit ).mul( 1.6 );
				texColor.assign( mix( texColor, veil, k ).add( ENV.fogColor.mul( disc ) ) );

			} );

			return vec4( texColor, 1.0 );

		} )();

		material.side = BackSide;
		material.depthWrite = false;
		material.fog = false;

		material.vertexNode = vertexNode;
		material.colorNode = colorNode;

	}

}

/** 1 for a standard depth buffer, 0 for a reversed one (set by the renderer). */
const SKY_FAR = uniform( 1 );

export { SkyMesh, SKY_FAR };

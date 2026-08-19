export const portraitVertex = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uProgress;
  void main() {
    vUv = uv;
    vec3 p = position;
    // subtle holographic ripple that grows with digital progress
    float w = sin(p.y * 6.0 + uTime * 1.2) * 0.008 * uProgress;
    p.z += w;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

export const portraitFragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uTexel;
  uniform float uTime;
  uniform float uProgress;   // 0 photo -> 1 fully digital
  uniform vec2 uPointer;     // uv-space pointer
  uniform float uPointerOn;
  uniform vec3 uAccent;
  uniform vec3 uAccent2;
  uniform float uOpacity;
  uniform float uLevels;
  uniform float uEdgeFade;   // 0..1 how much bottom fades out
  uniform float uExposure;   // overall brightness of the photo stage
  uniform float uVignette;   // 0 = none, 1 = strong radial falloff
  varying vec2 vUv;

  float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  // 5-tap blur for stable contours
  vec4 sampleSoft(vec2 uv) {
    vec4 c = texture2D(uTex, uv) * 0.4;
    c += texture2D(uTex, uv + vec2(uTexel.x, 0.0)) * 0.15;
    c += texture2D(uTex, uv - vec2(uTexel.x, 0.0)) * 0.15;
    c += texture2D(uTex, uv + vec2(0.0, uTexel.y)) * 0.15;
    c += texture2D(uTex, uv - vec2(0.0, uTexel.y)) * 0.15;
    return c;
  }

  void main() {
    vec2 uv = vUv;
    vec4 tex = sampleSoft(uv);
    float alpha = tex.a;
    if (alpha < 0.01) discard;

    float L = lum(tex.rgb);

    // --- contour (iso-luminance) lines ---
    float levels = uLevels;
    float field = L * levels + uTime * 0.05;
    float iso = abs(fract(field) - 0.5);
    float aa = fwidth(field) * 1.2 + 0.01;
    float line = 1.0 - smoothstep(0.0, aa * 2.2, iso);

    // luminance gradient magnitude -> edge/wire emphasis
    float lx = lum(texture2D(uTex, uv + vec2(uTexel.x * 2.0, 0.0)).rgb) - lum(texture2D(uTex, uv - vec2(uTexel.x * 2.0, 0.0)).rgb);
    float ly = lum(texture2D(uTex, uv + vec2(0.0, uTexel.y * 2.0)).rgb) - lum(texture2D(uTex, uv - vec2(0.0, uTexel.y * 2.0)).rgb);
    float edge = clamp(length(vec2(lx, ly)) * 6.0, 0.0, 1.0);

    // wireframe grid (warped by luminance) for the middle stage
    vec2 g = uv * vec2(38.0, 50.0) + vec2(L * 3.0, -L * 2.0);
    vec2 gf = abs(fract(g) - 0.5);
    float grid = 1.0 - smoothstep(0.0, 0.08, min(gf.x, gf.y));

    // particle dots for the final stage
    vec2 dcell = floor(uv * vec2(90.0, 120.0));
    vec2 dfr = fract(uv * vec2(90.0, 120.0)) - 0.5;
    float dh = hash(dcell);
    float dsize = 0.12 + L * 0.28;
    float dots = (1.0 - smoothstep(dsize, dsize + 0.12, length(dfr))) * step(0.35, dh + L * 0.5);
    dots *= 0.6 + 0.4 * sin(uTime * 2.0 + dh * 20.0);

    // scan sweep
    float scanPos = fract(uTime * 0.12);
    float scan = smoothstep(0.06, 0.0, abs(uv.y - (1.0 - scanPos))) * 0.9;
    float scanLines = 0.5 + 0.5 * sin(uv.y * 900.0 + uTime * 4.0);

    // pointer light
    float pl = uPointerOn * smoothstep(0.55, 0.0, distance(uv * vec2(1.0, 1.35), uPointer * vec2(1.0, 1.35)));

    // --- stage weights ---
    float p = uProgress;
    float wPhoto = 1.0 - smoothstep(0.15, 0.55, p);
    // contours stay subtle until the portrait is clearly mid-transformation
    float wLines = smoothstep(0.14, 0.45, p) * (1.0 - smoothstep(0.75, 1.0, p));
    float wGrid  = smoothstep(0.35, 0.6, p) * (1.0 - smoothstep(0.7, 0.95, p));
    float wDots  = smoothstep(0.7, 1.0, p);

    // photo tinted cool, desaturated and held well below full exposure so the
    // avatar reads as a presence in the scene rather than a lit billboard
    vec3 mono = vec3(L);
    vec3 photo = mix(tex.rgb, mono, 0.45);
    photo *= mix(vec3(0.78, 0.84, 1.05), vec3(1.0), 0.35);
    photo *= (0.9 + 0.1 * scanLines * (0.5 + p)) * uExposure;

    vec3 lineCol = mix(uAccent, uAccent2, uv.y + 0.2 * sin(uTime * 0.4));
    vec3 col = photo * wPhoto;
    col += lineCol * line * (0.7 + pl * 1.0) * wLines * (0.55 + 0.45 * L);
    col += lineCol * edge * 0.5 * (wLines + wGrid);
    col += lineCol * grid * 0.35 * wGrid * (0.4 + L);
    col += mix(uAccent2, vec3(1.0), 0.3) * dots * wDots;
    col += lineCol * scan * 0.35 * (0.3 + p);
    // pointer highlight on photo stage as a soft holographic light
    col += lineCol * pl * 0.12 * wPhoto;

    // hologram flicker / chroma
    float flick = 0.97 + 0.03 * sin(uTime * 22.0 + uv.y * 30.0);
    col *= flick;

    // edge fade so the bust melts into the environment
    float bottom = smoothstep(0.0, 0.42 * uEdgeFade + 0.001, uv.y);
    float side = smoothstep(0.0, 0.08, uv.x) * smoothstep(1.0, 0.92, uv.x);
    // radial vignette centred on the head keeps the plane's silhouette from
    // reading as a cut-out rectangle
    float vig = 1.0 - uVignette * smoothstep(0.28, 0.62, distance(uv, vec2(0.5, 0.62)));
    float a = alpha * bottom * side * clamp(vig, 0.0, 1.0);
    // final stage: dots have their own alpha
    float digitalAlpha = max(line * wLines, max(grid * wGrid * 0.6, dots * wDots));
    float outA = mix(a, a * clamp(digitalAlpha + edge * 0.5 + scan * 0.3, 0.0, 1.0), smoothstep(0.55, 0.9, p));

    gl_FragColor = vec4(col, outA * uOpacity);
  }
`;

import { Vec2, Renderer, Camera, Transform, Box, Program, Mesh } from 'ogl';

const vertex = `
attribute vec3 position;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragment = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2    u_resolution;
uniform float   u_time;

#include "lygia/space/ratio.glsl"
#include "lygia/math/decimate.glsl"

void main() {
    vec3 color = vec3(0.0);
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st = ratio(st, u_resolution);

    color = vec3(st.x,st.y,abs(sin(u_time)));
    color = decimate(color, 20.);

    gl_FragColor = vec4(color, 1.0);
}
`


{
  const renderer = new Renderer();
  const gl = renderer.gl;
  document.body.appendChild(gl.canvas);

  const camera = new Camera(gl);
  camera.position.z = 4;

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.perspective({
      aspect: gl.canvas.width / gl.canvas.height,
    });
  }

  window.addEventListener('resize', resize, false);
  resize();

  const scene = new Transform();
  const geometry = new Box(gl);
  const program = new Program(gl,
    {
      vertex: resolveLygia(vertex),
      fragment: resolveLygia(fragment),
      uniforms: {
        u_time: { value: 0 },
        u_resolution: {
          value: new Vec2(
            window.innerWidth,
            window.innerHeight
          )
        }
      }
    }
  );

  const mesh = new Mesh(gl, { geometry, program });
  mesh.setParent(scene);

  requestAnimationFrame(update);
  function update(t) {
    requestAnimationFrame(update);

    program.uniforms.u_time.value = t * 0.001;
    mesh.rotation.y -= 0.01;
    mesh.rotation.x += 0.02;
    renderer.render({ scene, camera });
  }
}
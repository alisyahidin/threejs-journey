import * as THREE from 'three'

const getRadian = (angle: number) => angle * Math.PI / 180

const wrapper = document.getElementById('circular');
wrapper?.classList.add('[&>*:nth-child(odd)]:bg-purple-400', '[&>*:nth-child(even)]:bg-blue-300')

const clock = new THREE.Clock()

const dots: HTMLDivElement[] = [];

const params = {
  radius: 200,
  length: 12,
}

for (let i = 0; i < params.length; i++) {
  const radian = getRadian(360 / params.length * i)

  dots[i] = document.createElement('div');
  dots[i].className = 'h-6 w-6 absolute inset-0 m-auto rounded-full';

  const x = Math.cos(radian) * params.radius;
  const y = Math.sin(radian) * params.radius;
  dots[i].style.transform = `translate(${x}px, ${y}px)`

  wrapper?.appendChild(dots[i]);
}

const loop = () => {
  const elapsedTime = clock.getElapsedTime();
  for (let i = 0; i < params.length; i++) {
    const radian = getRadian(360 / params.length * i)

    const x = Math.cos(radian + (elapsedTime * 0.3)) * params.radius;
    const y = Math.sin(radian + (elapsedTime * 0.3)) * params.radius;

    dots[i].style.transform = `translate(${x}px, ${y}px)`
  }
  requestAnimationFrame(loop)
}

loop()
const app = document.getElementById('app');
app?.classList.add('[&>*:nth-child(odd)]:bg-purple-400', '[&>*:nth-child(even)]:bg-blue-300')

const halfRadius = 300;

for (let i = 0; i < 44; i++) {
  const dot = document.createElement('div');
  dot.className = 'h-6 w-6 absolute inset-0 m-auto rounded-lg'

  const x = Math.sin(i + 1) * halfRadius;
  const y = Math.cos(i + 1) * halfRadius;

  dot.style.transform = `translate(${x}px, ${y}px)`

  app?.appendChild(dot);
}
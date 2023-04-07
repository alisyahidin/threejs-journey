import * as paper from 'paper';

const canvas = document.getElementById('wheel') as HTMLCanvasElement

paper.setup('wheel');
paper.view.autoUpdate = true

const radius = 200
const gray = new paper.Color(0.6, 0.6, 0.6)
const blue = new paper.Color(100 / 255, 152 / 255, 237 / 255)

new paper.Path.Circle({
  center: paper.view.center,
  radius: radius,
  strokeColor: blue,
  strokeWidth: 2,
});

const pointer = new paper.Path.Line(paper.view.center, new paper.Point(paper.view.center.x + radius, paper.view.center.y))
pointer.strokeColor = gray;
pointer.strokeWidth = 2;

// ---------


const circleFull = 12

const wheel = new paper.Group()

for (let i = 0; i < circleFull; i++) {
  const seg = new paper.Path();
  const circum = radius / 2 * 2 * Math.PI
  const step = circum / circleFull
  console.log(step)
  seg.add([0, 0], [radius / 2, -step / 2 - 0.5], [radius / 2, step / 2 + 0.5])
  seg.fillColor = blue
  seg.fillColor.hue += 360 / circleFull * i
  seg.rotate(360 / circleFull * i, [0, 0])
  wheel.addChild(seg)
}

wheel.position = paper.view.center
import * as paper from 'paper';

const canvas = document.getElementById('circle') as HTMLCanvasElement

paper.setup('circle');
paper.view.autoUpdate = true

const radius = 200
const blue = new paper.Color(0, 0, 1)

canvas.onmousemove = function (e: MouseEvent) {
  const newPoint = new paper.Point(
    paper.view.center.x - e.clientX,
    paper.view.center.y - e.clientY,
  )

  const newX = -Math.cos((newPoint.angle * Math.PI / 180)) * radius
  const newY = Math.sin((newPoint.angle * Math.PI / 180)) * radius

  path.segments[1].point = new paper.Point(paper.view.center.x + newX, paper.view.center.y - newY)
}

const circle = new paper.Path.Circle({
  center: paper.view.center,
  radius: radius,
  strokeColor: blue
});

const path = new paper.Path.Line(paper.view.center, new paper.Point(paper.view.center.x + radius, paper.view.center.y))
path.strokeColor = blue;
path.rotate(45, paper.view.center)

paper.view.onResize = function () {
  circle.position = paper.view.center
  path.segments[0].point = paper.view.center
}
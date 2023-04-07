import * as paper from 'paper';
import { getRadian } from './circular';

const canvas = document.getElementById('circle') as HTMLCanvasElement

paper.setup('circle');
paper.view.autoUpdate = true

const radius = 200
const blue = new paper.Color(0, 0, 1)
const green = new paper.Color(0, 1, 0)
const yellow = new paper.Color(0, 1, 1)

const circle = new paper.Path.Circle({
  center: paper.view.center,
  radius: radius,
  strokeColor: blue,
  strokeWidth: 2,
});

const pointer = new paper.Path.Line(paper.view.center, new paper.Point(paper.view.center.x + radius, paper.view.center.y))
pointer.strokeColor = blue;
pointer.strokeWidth = 2;

const cos = new paper.Path.Line(paper.view.center, pointer.segments[1].point)
cos.strokeColor = green;
cos.strokeWidth = 2;

const sin = new paper.Path.Line(cos.segments[1].point, cos.segments[1].point)
sin.strokeColor = yellow;
sin.strokeWidth = 2;

paper.view.onResize = function () {
  circle.position = paper.view.center
  pointer.segments[0].point = paper.view.center
  cos.segments[0].point.set(paper.view.center)
}

canvas.onmousemove = function (e: MouseEvent) {
  const cursorPoint = new paper.Point(
    -(paper.view.center.x - e.pageX),
    -((e.pageY - canvas.offsetTop) - paper.view.center.y),
  )

  const x = Math.cos((cursorPoint.angle * Math.PI / 180)) * radius
  const y = Math.sin((cursorPoint.angle * Math.PI / 180)) * radius

  pointer.segments[1].point.set(paper.view.center.x + x, paper.view.center.y - y)

  cos.segments[1].point.set(pointer.segments[1].point.x, paper.view.center.y)

  sin.segments[0].point.set(cos.segments[1].point)
  sin.segments[1].point.set(pointer.segments[1].point)
}
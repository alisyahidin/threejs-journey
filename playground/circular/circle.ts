import * as paper from 'paper';
import { getRadian } from './circular';

const canvas = document.getElementById('circle') as HTMLCanvasElement

paper.setup('circle');
paper.view.autoUpdate = true

const radius = 200
const gray = new paper.Color(0.6, 0.6, 0.6)
const blue = new paper.Color(100 / 255, 152 / 255, 237 / 255)
const green = new paper.Color(0, 1, 0)
const pink = new paper.Color(227 / 255, 50 / 255, 224 / 255)

const circle = new paper.Path.Circle({
  center: paper.view.center,
  radius: radius,
  strokeColor: blue,
  strokeWidth: 2,
});

const pointer = new paper.Path.Line(paper.view.center, new paper.Point(paper.view.center.x + radius, paper.view.center.y))
pointer.strokeColor = gray;
pointer.strokeWidth = 2;

const cos = new paper.Path.Line(paper.view.center, pointer.segments[1].point)
cos.strokeColor = green;
cos.strokeWidth = 2;

// const cosText = new paper.PointText(new paper.Point(pointer.segments[1].point.x - paper.view.center.x, paper.view.center.y))
// cosText.content = '1'
// cosText.fillColor = green

const sin = new paper.Path.Line(cos.segments[1].point, cos.segments[1].point)
sin.strokeColor = pink;
sin.strokeWidth = 2;

const sinText = new paper.PointText(sin.segments[1].point)
sinText.content = '0'
sinText.fillColor = pink

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
  console.log(pointer.segments[1].point, cursorPoint.angle)
  const x = Math.cos((cursorPoint.angle * Math.PI / 180)) * radius
  const y = Math.sin((cursorPoint.angle * Math.PI / 180)) * radius

  pointer.segments[1].point.set(paper.view.center.x + x, paper.view.center.y - y)

  cos.segments[1].point.set(pointer.segments[1].point.x, paper.view.center.y)

  sin.segments[0].point.set(cos.segments[1].point)
  sin.segments[1].point.set(pointer.segments[1].point)
  sinText.point.set(sin.segments[1].point.x, paper.view.center.y - (y / 2))
  sinText.content = Math.sin(getRadian(cursorPoint.angle)).toFixed(5).toString()
}
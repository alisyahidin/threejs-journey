import * as paper from 'paper';

const canvas = document.getElementById('wheel')!;

paper.setup('wheel');
paper.view.autoUpdate = true

const radius = 400

const rad = (angle: number) => (angle * Math.PI / 180)

const getAngle = (angle: number) => new paper.Point(
  paper.view.center.x + (Math.cos(rad(angle)) * radius),
  paper.view.center.y - (Math.sin(rad(angle)) * radius)
)

const wheel = new paper.Group()

const foods = [
  { title: 'Banana', color: 'red', probability: 0.3 },
  { title: 'Mango', color: 'blue', probability: 0.4 },
  { title: 'Pineapple', color: 'green', probability: 0.3 },
  { title: 'Pineapple', color: 'yellow', probability: 0.3 },
  { title: 'Pineapple', color: 'orange', probability: 0.3 },
  { title: 'Pineapple', color: 'purple', probability: 0.3 },
  // { title: 'Pineapple', color: 'black', probability: 0.3 },
  // { title: 'Pineapple', color: 'white', probability: 0.3 },
  // { title: 'Pineapple', color: 'pink', probability: 0.3 },
]


foods.forEach((food, i) => {
  const rotation = 360 / foods.length;

  const pie = new paper.Path.Arc({
    from: getAngle(rotation * i),
    through: getAngle((rotation * i) + (rotation / 2)),
    to: getAngle(rotation * (i + 1)),
    fillColor: food.color,
  })

  pie.add(new paper.Point(paper.view.center));
  wheel.addChild(pie)
})

paper.view.onResize = () => {
  wheel.position = paper.view.center
}

// control animation

let duration = 8;
let isClicked = false
let isAnimating = false
let starttime = 0;

canvas.onclick = () => {
  if (isAnimating) return

  isClicked = !isClicked

  if (isClicked) {
    paper.view.onFrame = animate
  } else {
    paper.view.onFrame = null
    starttime = 0
  }
}

function animate(event) {
  if (isClicked && starttime === 0) {
    starttime = event.time;
    isAnimating = true
    canvas.classList.add('cursor-not-allowed')
  }

  const runtime = event.time - starttime;
  const relativeProgress = runtime / duration

  const rotation = 30 * (relativeProgress <= 0.5 ? relativeProgress : 1 - relativeProgress)

  if (isClicked) {
    wheel.rotate(rotation)
  }

  if (relativeProgress > 1) {
    canvas.classList.remove('cursor-not-allowed')
    isClicked = false
    starttime = 0
    isAnimating = false
    paper.view.onFrame = null
  }
}
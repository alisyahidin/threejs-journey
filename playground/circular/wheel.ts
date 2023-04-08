import * as paper from 'paper';
import ProbabilityPick, { ProbabilityConfig } from "probability-pick";

const canvas = document.getElementById('wheel') as HTMLCanvasElement

paper.setup('wheel');
paper.view.autoUpdate = true

const radius = 400

const rad = (angle: number) => (angle * Math.PI / 180)

const getRadFromAngle = (angle: number) => new paper.Point(
  paper.view.center.x + (Math.cos(rad(angle)) * radius),
  paper.view.center.y - (Math.sin(rad(angle)) * radius)
)

const wheel = new paper.Group()
wheel.applyMatrix = false

type Food = {
  color: string
  probability: number | string
  angle?: number
}

const colors: Food[] = [
  { color: 'red', probability: 'auto' },
  { color: 'blue', probability: 'auto' },
  { color: 'green', probability: 'auto' },
  { color: 'yellow', probability: 'auto' },
  { color: 'orange', probability: 'auto' },
  { color: 'purple', probability: 'auto' },
  { color: 'black', probability: 'auto' },
  { color: 'grey', probability: 'auto' },
  { color: 'pink', probability: 'auto' },
  { color: 'lightblue', probability: 'auto' },
]

colors.forEach((food, i) => {
  const rotation = 360 / colors.length;

  colors[i].angle = (rotation * i) + (rotation / 2);

  const pie = new paper.Path.Arc({
    from: getRadFromAngle(rotation * i),
    through: getRadFromAngle((rotation * i) + (rotation / 2)),
    to: getRadFromAngle(rotation * (i + 1)),
    fillColor: food.color,
  })

  pie.add(new paper.Point(paper.view.center));
  wheel.addChild(pie)
})

paper.view.onResize = () => {
  wheel.position = paper.view.center
}

// control animation

let isAnimating = false

const dataList: ProbabilityConfig = colors.reduce((prev, current, i) => {
  prev[i] = current.probability
  return prev
}, {})

const onHover = () => {
  if (!isAnimating) {
    canvas.classList.add('cursor-pointer')
  }
}

wheel.onMouseEnter = onHover
wheel.onMouseMove = onHover
wheel.onMouseLeave = () => {
  canvas.classList.remove('cursor-pointer')
}

wheel.onClick = () => {
  if (isAnimating) return

  isAnimating = true
  canvas.classList.remove('cursor-pointer')
  canvas.classList.add('cursor-not-allowed')
  const picker = new ProbabilityPick({ ...dataList })
  const selectedColor = colors[picker.get().value as number]

  const step = 5 * 360;
  const targetRotation = wheel.rotation + step + (selectedColor.angle as number)
  const tween = wheel.tween({ rotation: wheel.rotation, }, { rotation: targetRotation }, { duration: 5000, easing: 'easeInOutCubic' })
  tween.onUpdate = (e) => {
    if (e.progress === 1) {
      alert(selectedColor.color)
      wheel.rotation = 0
      canvas.classList.remove('cursor-not-allowed')
      isAnimating = false
    }
  }
}
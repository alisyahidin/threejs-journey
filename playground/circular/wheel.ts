import * as paper from 'paper';

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
  probability: number
  angle?: number
}

const foods: Food[] = [
  { color: 'red', probability: 0 },
  { color: 'blue', probability: 0 },
  { color: 'green', probability: 0 },
  { color: 'yellow', probability: 0 },
  { color: 'orange', probability: 0 },
  { color: 'purple', probability: 0 },
  { color: 'black', probability: 0 },
  { color: 'white', probability: 0 },
  { color: 'pink', probability: 1 },
]


foods.forEach((food, i) => {
  const rotation = 360 / foods.length;

  foods[i].angle = (rotation * i) + (rotation / 2);

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


wheel.onClick = () => {
  const step = 5 * 360;
  const selected = foods[1].angle as number
  const targetRotation = wheel.rotation + step + selected
  const tween = wheel.tween({ rotation: wheel.rotation, }, { rotation: targetRotation }, { duration: 5000, easing: 'easeInOutCubic' })
  tween.onUpdate = (e) => {
    if (e.progress === 1) {
      alert('Yeaayyy')
      wheel.rotation = 0
    }
  }
}
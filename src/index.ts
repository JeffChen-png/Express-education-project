import express, { Request, Response } from "express"
import { CourseCreateModel } from "./models/CourseCreateModel"
import { CourseUpdateModel } from "./models/CourseUpdateModel"
import { CourseViewModel } from "./models/CourseViewModel"
import { getCourseQueryModel } from "./models/getCourseQueryModel"
import { URIParamsCourseModel } from "./models/URIParamsCourseModel"
import { RequestWithBody, RequestWithParams, RequestWithParamsAndBody, RequestWithQuery } from "./types/types"

export const app = express()
const port = 3010

type CourseType = {
  id: number,
  title: string,
  studentsCount: number
}

const data: { courses: CourseType[] } = {
  courses: [
    { id: 1, title: "1", studentsCount: 3 },
    { id: 2, title: "2", studentsCount: 2 },
    { id: 3, title: "3", studentsCount: 0 },
  ]
}

export const HTTP_STATUSES = {
  OK_200: 200,
  CREATED_201: 201,
  NO_CONTENT_204: 204,
  BAD_REQUEST_400: 400,
  NOT_FOUND_404: 404,
}

const getViewModelCouse = (course: CourseType): CourseViewModel => {
  return {
    id: course.id,
    title: course.title
  }
}

const jsonBodyMiddlewear = express.json()
app.use(jsonBodyMiddlewear)

app.get('/courses', (req: RequestWithBody<getCourseQueryModel>, res: Response<CourseViewModel[]>) => {
  let courses = data.courses

  if (req.query.title) {
    courses = courses.filter(c => c.title.indexOf(req.query.title as string) > -1)
  }

  res.json(courses.map(getViewModelCouse))
})

app.get('/courses/:id', (req: RequestWithParams<URIParamsCourseModel>, res: Response<CourseViewModel>) => {
  const course = data.courses.find(c => c.id === +req.params.id)
  if (!course) {
    res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    return
  }
  res.json(getViewModelCouse(course))
})

app.post('/courses', (req: RequestWithBody<CourseCreateModel>, res: Response<CourseViewModel>) => {
  if (!req.body.title) {
    res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
    return
  }

  const newCourse: CourseType = {
    id: +(new Date()),
    title: req.body.title,
    studentsCount: 0
  }

  data.courses.push(newCourse)

  res.status(HTTP_STATUSES.CREATED_201).json(getViewModelCouse(newCourse))
})

app.put('/courses/:id', (req: RequestWithParamsAndBody<URIParamsCourseModel, CourseUpdateModel>, res) => {
  if (!req.params.id) {
    res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    return
  }

  if (!req.body.title) {
    res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
    return
  }

  const course = data.courses.find(c => c.id === +req.params.id)

  if (!course) {
    res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    return
  }

  course.title = req.body.title

  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})


app.delete('/courses/:id', (req: RequestWithParams<URIParamsCourseModel>, res) => {
  data.courses = data.courses.filter(c => c.id !== +req.params.id)

  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.delete('/__courses__/data', (req, res) => {
  data.courses = []
  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

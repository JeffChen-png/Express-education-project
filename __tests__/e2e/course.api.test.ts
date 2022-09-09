import request from "supertest"
import { app, HTTP_STATUSES } from "../../src"
import { CourseCreateModel } from "../../src/models/CourseCreateModel"
import { CourseUpdateModel } from "../../src/models/CourseUpdateModel"

describe("/courses", () => {

  beforeAll(async () => {
    await request(app).delete("/__courses__/data")
  })

  it("should return 200 and empty array", async () => {
    await request(app)
      .get("/courses")
      .expect(HTTP_STATUSES.OK_200, [])
  })

  it("should return 404 for not existing course", async () => {
    await request(app)
      .get("/courses/1")
      .expect(HTTP_STATUSES.NOT_FOUND_404)
  })

  it("shouldnt create cource with correct input data", async () => {
    const data: CourseCreateModel = { title: "" }
    await request(app)
      .post("/courses")
      .send(data)
      .expect(HTTP_STATUSES.BAD_REQUEST_400)
  })

  it("should return 200 and empty array", async () => {
    await request(app)
      .get("/courses")
      .expect(HTTP_STATUSES.OK_200, [])
  })

  let newCourse: any = null

  it("should create cource with correct input data", async () => {
    const title = "new course"

    const data: CourseCreateModel = { title: title }

    const res = await request(app)
      .post("/courses")
      .send(data)
      .expect(HTTP_STATUSES.CREATED_201)

    newCourse = res.body

    expect(newCourse).toEqual({
      id: expect.any(Number),
      title: data.title
    })


    await request(app)
      .get("/courses")
      .expect(HTTP_STATUSES.OK_200, [newCourse])
  })

  it("shouldnt update that title empty", async () => {
    const data: CourseUpdateModel = { title: "" }

    await request(app)
      .put(`/courses/${newCourse.id}`)
      .send(data)
      .expect(HTTP_STATUSES.BAD_REQUEST_400)

    await request(app)
      .get("/courses")
      .expect(HTTP_STATUSES.OK_200, [newCourse])
  })

  it("should return 200 and [newCourse]", async () => {
    await request(app)
      .get(`/courses/${newCourse.id}`)
      .expect(HTTP_STATUSES.OK_200, newCourse)
  })

  it("shouldnt update cource that not exist", async () => {
    const data: CourseUpdateModel = { title: "" }

    await request(app)
      .put(`/courses/777`)
      .send(data)
      .expect(HTTP_STATUSES.BAD_REQUEST_400)
  })

  it("should update newcourse", async () => {

    const title = "newCourse"
    const data: CourseUpdateModel = { title: title }

    await request(app)
      .put(`/courses/${newCourse.id}`)
      .send(data)
      .expect(HTTP_STATUSES.NO_CONTENT_204)
  })


  it("should delete", async () => {
    // const title = "newCourse"
    await request(app)
      .delete(`/courses/${newCourse.id}`)
      // .send({ title: title })
      .expect(HTTP_STATUSES.NO_CONTENT_204)

    await request(app)
      .get(`/courses/${newCourse.id}`)
      .expect(HTTP_STATUSES.NOT_FOUND_404)
  })
})
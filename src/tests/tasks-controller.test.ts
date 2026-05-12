import "dotenv/config";
import { app } from "@/app";
import prisma from "@/database/prisma";
import request from "supertest";
import { randomUUID } from "node:crypto";

describe("TasksController", () => {
  let user_id: string | undefined;
  let token: string;
  let team_id: string;
  let task_id: string | undefined;

  beforeAll(async () => {
    await prisma.tasks.deleteMany({
      where: {
        team: { name: "Task Team Test" },
        creator: { name: "Task Test User" },
      },
    });

    await prisma.teams.deleteMany({ where: { name: "Task Team Test" } });

    await prisma.user.deleteMany({ where: { name: "Task Test User" } });

    const userResponse = await request(app).post("/users").send({
      name: "Task Test User",
      email: "task_test_user@example.com",
      password: "password123",
    });

    user_id = userResponse.body.id;

    await prisma.user.updateMany({
      data: { role: "admin" },
      where: { email: "task_test_user@example.com" },
    });

    expect(userResponse.status).toBe(201);

    const sessionResponse = await request(app).post("/sessions").send({
      email: "task_test_user@example.com",
      password: "password123",
    });

    token = sessionResponse.body.token;

    await prisma.teams.deleteMany({
      where: {
        name: "Task Team Test",
      },
    });

    const teamResponse = await request(app)
      .post("/teams")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Task Team Test", description: "A team for test" });

    team_id = teamResponse.body.team.id;

    await request(app)
      .post("/team-members")
      .set("Authorization", `Bearer ${token}`)
      .send({ user_id: user_id, team_id: team_id });
  });

  afterAll(async () => {
    if (task_id) {
      await prisma.tasks.deleteMany({ where: { id: task_id } });

      await prisma.teams.deleteMany({
        where: {
          id: team_id,
        },
      });
      await prisma.user.deleteMany({ where: { id: user_id } });
    }
  });

  it("should to create a new task successfully", async () => {
    const taskResponse = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Task Test",
        description: "Testing tasks",
        status: "pending",
        priority: "low",
        responsible: user_id,
        team_id: team_id,
      });

    task_id = taskResponse.body.id;

    expect(taskResponse.status).toBe(201);
    expect(taskResponse.body).toEqual(expect.objectContaining({ id: task_id }));
  });

  it("should throw an error if user try to assign task to user that not exist in that team", async () => {
    const taskResponse = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Task Test",
        description: "Testing tasks",
        status: "pending",
        priority: "low",
        responsible: randomUUID(),
        team_id: team_id,
      });

    expect(taskResponse.status).toBe(400);
    expect(taskResponse.body.message).toBe("Add member to this team before");
  });

  it("should to update an task successfully", async () => {
    const taskResponse = await request(app)
      .patch(`/tasks/${task_id}/update`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Task Test",
        description: "Update test task",
        status: "in_progress",
        priority: "high",
        responsible: user_id,
        team_id: team_id,
      });

    expect(taskResponse.status).toBe(200);
  });

  it("should throw an error if the task selected to update not exist", async () => {
    const taskResponse = await request(app)
      .patch(`/tasks/${randomUUID()}/update`)
      .set("Authorization", `Bearer ${token}`);

    expect(taskResponse.status).toBe(404);
    expect(taskResponse.body.message).toBe("Task not found");
  });

  it("should throw an error if the responsible assigned on update not exist", async () => {
    const taskResponse = await request(app)
      .patch(`/tasks/${task_id}/update`)
      .set("Authorization", `Bearer ${token}`)
      .send({ responsible: randomUUID() });

    expect(taskResponse.status).toBe(404);
    expect(taskResponse.body.message).toBe("member not found");
  });

  it("should to update an task successfully", async () => {
    const taskResponse = await request(app)
      .delete(`/tasks/${task_id}/remove`)
      .set("Authorization", `Bearer ${token}`);

    expect(taskResponse.status).toBe(200);
    expect(taskResponse.body).toBe("Task was removed!");
  });
});

describe("TaskController User Unauthorized", () => {
   let user_id: string | undefined;
  let token: string;
  let team_id: string;

  beforeAll(async () => {

    await prisma.tasks.deleteMany({
      where: {
        team: { name: "Task Team Test Member" },
        creator: { name: "Task Test Admin" },
      },
    });

    await prisma.teams.deleteMany({ where: { name: "Task Team Test Member" } });

    await prisma.user.deleteMany({ where: { name: "Task Test Admin" } });

    await prisma.user.deleteMany({ where: { name: "Task Test Member" } });

    const userResponse = await request(app).post("/users").send({
      name: "Task Test Admin",
      email: "task_test_admin@example.com",
      password: "password123",
    });

    user_id = userResponse.body.id;

    await prisma.user.updateMany({
      data: { role: "admin" },
      where: { email: "task_test_admin@example.com" },
    });

    expect(userResponse.status).toBe(201);

    const sessionResponse = await request(app).post("/sessions").send({
      email: "task_test_admin@example.com",
      password: "password123",
    });

    token = sessionResponse.body.token;

    const teamResponse = await request(app)
      .post("/teams")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Task Team Test Member", description: "A team for test" });

    team_id = teamResponse.body.team.id;

    await request(app)
      .post("/team-members")
      .set("Authorization", `Bearer ${token}`)
      .send({ user_id: user_id, team_id: team_id });
  });

  afterAll(async () => {
    if (team_id) {

      await prisma.teams.deleteMany({
        where: {
          id: team_id,
        },
      });
      await prisma.user.deleteMany({ where: { id: user_id } });
      await prisma.user.deleteMany({ where: { name: "Task Test Admin" } });
      await prisma.user.deleteMany({ where: { name: "Task Test Member" } });

    }
  });

  it("should throw an error if unauthorized user try to create a task to team whose it isn't yours", async () => {
    const userResponse = await request(app).post("/users").send({
      name: "Task Test Member",
      email: "task_test_member@example.com",
      password: "password123",
    });

    user_id = userResponse.body.id;

    expect(userResponse.status).toBe(201);

    const sessionResponse = await request(app).post("/sessions").send({
      email: "task_test_member@example.com",
      password: "password123",
    });

    token = sessionResponse.body.token;

    const taskResponse = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`).send({
        team_id: team_id
      })
    
    expect(taskResponse.status).toBe(403);
  });
})

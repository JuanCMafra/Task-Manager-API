import "dotenv/config";
import { app } from "@/app";
import prisma from "@/database/prisma";
import request from "supertest";
import { randomUUID } from "node:crypto";

describe("TeamsController authorized user", () => {
  let user_id: string | undefined;
  let token: string;
  let team_id: string

  afterAll(async () => {
    if (user_id) {
      await prisma.user.deleteMany({ where: { id: user_id } });

      await prisma.teams.deleteMany({
        where: {
          id: team_id,
        },
      });
    }
  });

  beforeAll(async () => {
    const userResponse = await request(app).post("/users").send({
      name: "Team Test User Admin",
      email: `team_test_user_admin@example.com`,
      password: "password123",
    });

    user_id = userResponse.body.id;

    await prisma.user.updateMany({
      data: { role: "admin" },
      where: { email: "team_test_user_admin@example.com" },
    });

    const sessionResponse = await request(app).post("/sessions").send({
      email: "team_test_user_admin@example.com",
      password: "password123",
    });

    token = sessionResponse.body.token;

    await prisma.user.deleteMany({
      where: {
        email: "team_test_user_admin@example.com",
      },
    });

    await prisma.teams.deleteMany({
      where: {
        name: "Team Test",
      },
    });
  });

  it("should create a new team successfully", async () => {
    const teamResponse = await request(app)
      .post("/teams")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Team Test", description: "A team for test" });

    expect(teamResponse.status).toBe(201);
    expect(teamResponse.body.team).toHaveProperty("id");
    expect(teamResponse.body.team.name).toBe("Team Test");

    team_id = teamResponse.body.team.id
  });

  it("should throw an error if it try to create a team with same name", async () => {
    const teamResponse = await request(app)
      .post("/teams")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Team Test", description: "A team for test" });

    expect(teamResponse.status).toBe(400);
    expect(teamResponse.body.message).toBe(
      "team with same name already exists",
    );
  });

  it("should show the teams", async () => {
    const teamResponse = await request(app)
      .get(`/teams`)
      .set("Authorization", `Bearer ${token}`)

      expect(teamResponse.status).toBe(200)
      expect(teamResponse.body).toContainEqual(expect.objectContaining({name: "Team Test"}))
      expect(teamResponse.body).toContainEqual(expect.objectContaining({team_id: team_id}))
      expect(teamResponse.body).toContainEqual(expect.objectContaining({description: "A team for test"}))
  });

  it("should update an team", async () => {
    const teamResponse = await request(app)
      .patch(`/teams/${team_id}/update`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Team",
      });

      expect(teamResponse.status).toBe(200)
      expect(teamResponse.body.name).toBe("Updated Team")
  });

  it("should delete an team", async () => {
    const teamResponse = await request(app)
      .delete(`/teams/${team_id}/remove`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Team",
      });

      expect(teamResponse.status).toBe(200)
      expect(teamResponse.body.message).toBe("The team was removed!")
  });

  it("should throw an error if it try to delete an team that not exist", async () => {


    const teamResponse = await request(app)
      .delete(`/teams/${randomUUID()}/remove`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Team",
      });

      expect(teamResponse.status).toBe(404)
      expect(teamResponse.body.message).toBe("Team not found")
  });
});

describe("TeamsController unauthorized user", () => {
  let user_id: string | undefined;
  let token: string;

  afterAll(async () => {
    if (user_id) {
      await prisma.user.deleteMany({ where: { id: user_id } });

      await prisma.teams.deleteMany({
        where: {
          name: "Team Test Member",
        },
      });
    }
  });

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: "team_test_user_member@example.com",
      },
    });

    await prisma.teams.deleteMany({
      where: {
        name: "Team Test Member",
      },
    });

    const userResponse = await request(app).post("/users").send({
      name: "Team Test Member",
      email: "team_test_user_member@example.com",
      password: "password123",
    });

    user_id = userResponse.body.id;

    const sessionResponse = await request(app).post("/sessions").send({
      email: "team_test_user_member@example.com",
      password: "password123",
    });

    token = sessionResponse.body.token;

    
  });

  it("should throw an error if unauthorized user try to create a team", async () => {
    const teamResponse = await request(app)
      .post("/teams")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Team Test Member", description: "A team for test" });

    expect(teamResponse.status).toBe(401);
  });

  it("should throw an error if unauthorized user try to get the teams", async () => {
    const teamResponse = await request(app)
      .get("/teams")
      .set("Authorization", `Bearer ${token}`)

    expect(teamResponse.status).toBe(401);
  });

  it("should throw an error if unauthorized user try to update a team", async () => {
    const teamResponse = await request(app)
      .patch(`/teams/:id/update`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Team Member",
      });

      expect(teamResponse.status).toBe(401);
  });

  it("should throw an error if unauthorized user try to delete a team", async () => {
    const teamResponse = await request(app)
      .delete(`/teams/:id/update`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Team Member",
      });

      expect(teamResponse.status).toBe(401);
  });
});

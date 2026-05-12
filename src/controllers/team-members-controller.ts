import prisma from "../database/prisma";
import { AppError } from "../utils/AppError";

import { Request, Response, NextFunction } from "express";
import z from "zod";

class TeamMembersController {
  async create(req: Request, res: Response, next: NextFunction) {
    const bodySchema = z.object({
      user_id: z.uuid(),
      team_id: z.uuid(),
    });

    const { user_id, team_id } = bodySchema.parse(req.body);

    const memberAlreadyExists = await prisma.teamMembers.findFirst({
      where: { teamId: team_id, userId: user_id },
    });

    const member = await prisma.user.findUnique({
      where: { id: user_id },
    });

    const team = await prisma.teams.findUnique({
      where: { id: team_id },
    });

    if (memberAlreadyExists) {
      return next(new AppError("this member already belongs to this team"));
    }

    if (!team) {
      return next(new AppError("Team not found", 404));
    }

    if (!member) {
      return next(new AppError("Member not found", 404));
    }

    await prisma.teamMembers.create({
      data: {
        userId: user_id,
        teamId: team_id,
      },
    });

    return res.status(201).json("Member was added");
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    const paramsSchema = z.object({
      team_id: z.uuid(),
    });

    const { team_id } = paramsSchema.parse(req.params);

    const teamMember = await prisma.teamMembers.findUnique({
      where: { id: team_id },
    });

    if (!teamMember) {
      return next(new AppError("The member is not in this team", 404));
    }

    await prisma.teamMembers.delete({
      where: { id: team_id },
    });

    return res.json("The member was removed with success!");
  }

  async show(req: Request, res: Response, next: NextFunction) {
    const paramsSchema = z.object({
      team_id: z.uuid(),
    });

    const { team_id } = paramsSchema.parse(req.params);

    const teamSelected = await prisma.teams.findUnique({
      where: { id: team_id },
      include: { members: { select: { user: { select: { name: true } } } } },
    });

    if (!teamSelected) {
      return next(new AppError("Team not found", 404));
    }

    const showTeamMembers = {
      team: teamSelected.name,
      members: teamSelected.members.map((member) => member.user.name),
    };

    return res.json(showTeamMembers);
  }
}

export { TeamMembersController };

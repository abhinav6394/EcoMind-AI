import { NextResponse } from "next/server";
import { randomUUID } from "crypto";


let inMemoryCommunities = [];

let prismaClient = null;
try {
	
	const { PrismaClient } = require("@prisma/client");
	prismaClient = new PrismaClient();
} catch (e) {
	prismaClient = null;
}

function validateBody(body) {
	const errors = [];
	if (!body || typeof body !== "object") {
		errors.push("Invalid JSON body");
		return errors;
	}
	if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
		errors.push("'name' is required and must be a non-empty string");
	}
	if (!body.description || typeof body.description !== "string") {
		errors.push("'description' is required and must be a string");
	}
	if (!body.leaderId || typeof body.leaderId !== "string") {
		errors.push("'leaderId' is required and must be a string");
	}
	if (body.location && typeof body.location !== "string") {
		errors.push("'location' must be a string if provided");
	}
	if (
		body.establishedYear !== undefined &&
		(!Number.isInteger(body.establishedYear) || body.establishedYear < 0)
	) {
		errors.push("'establishedYear' must be a positive integer if provided");
	}
	return errors;
}

export async function POST(request) {
    
	const auth = request.headers.get("authorization") || "";
	if (!auth.toLowerCase().startsWith("bearer ")) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let body;
	try {
		body = await request.json();
	} catch (e) {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const errors = validateBody(body);
	if (errors.length) {
		return NextResponse.json({ errors }, { status: 400 });
	}

	const payload = {
		id: randomUUID(),
		name: body.name.trim(),
		description: body.description,
		leaderId: body.leaderId,
		location: body.location || null,
		establishedYear: body.establishedYear || null,
		createdAt: new Date().toISOString(),
	};

	if (prismaClient) {
		try {
			// Attempt to persist using Prisma. This assumes a `Community` model
			// exists in your Prisma schema with matching fields. If it doesn't,
			// this will throw and we fall back to in-memory storage.
			// eslint-disable-next-line global-require
			const created = await prismaClient.community.create({ data: payload });
			return NextResponse.json({ community: created }, { status: 201 });
		} catch (e) {
			// swallow and fallback to in-memory
		}
	}

	// Fallback: store in-memory (useful for local dev or when Prisma isn't ready)
	inMemoryCommunities.push(payload);

	return NextResponse.json({ community: payload }, { status: 201 });
}


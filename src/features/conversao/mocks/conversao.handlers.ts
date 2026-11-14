import { http, HttpResponse } from "msw/http";

export const handlersConversao = [
  http.post("*/api/conversao/cta", () => new HttpResponse(null, { status: 204 })),
];

import { http, HttpResponse } from "msw/http";

export const handlersSaude = [http.get("*/api", () => HttpResponse.text("Hello World!"))];

export const apiComFalha = http.get("*/api", () => new HttpResponse(null, { status: 503 }));

export const apiForaDoAr = http.get("*/api", () => HttpResponse.error());

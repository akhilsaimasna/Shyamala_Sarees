import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_PASSWORD_RESET_URL, passwordRecoveryProblem, requestAdminPasswordRecovery } from "../src/lib/password-recovery.ts";

test("password recovery requires matching passwords within the allowed boundaries", () => {
    assert.ok(passwordRecoveryProblem("short", "short"));
    assert.ok(passwordRecoveryProblem("a".repeat(12), "b".repeat(12)));
    assert.ok(passwordRecoveryProblem("a".repeat(129), "a".repeat(129)));
    assert.equal(passwordRecoveryProblem("a".repeat(12), "a".repeat(12)), null);
    assert.equal(passwordRecoveryProblem("a".repeat(128), "a".repeat(128)), null);
});

test("the recovery request uses the production reset URL and sends no password or role", async () => {
    let calls = 0;
    const client = createClient("https://auth.example", "test-publishable-key", {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: { fetch: async (input, init) => {
            calls++;
            const url = new URL(String(input));
            assert.equal(url.pathname, "/auth/v1/recover");
            assert.equal(url.searchParams.get("redirect_to"), ADMIN_PASSWORD_RESET_URL);
            const body = JSON.parse(String(init?.body));
            assert.equal(body.email, "owner@example.com");
            assert.equal(body.password, undefined);
            assert.equal(body.app_metadata, undefined);
            return new Response("{}", { status: 200, headers: { "content-type": "application/json" } });
        } },
    });
    const { error } = await requestAdminPasswordRecovery(client.auth, " owner@example.com ");
    assert.equal(error, null);
    assert.equal(calls, 1);
});

test("recovery delivery errors are preserved rather than reported as sent", async () => {
    const client = createClient("https://auth.example", "test-publishable-key", {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: { fetch: async () => new Response(JSON.stringify({ code: "over_email_send_rate_limit", msg: "Try later" }), { status: 429, headers: { "content-type": "application/json" } }) },
    });
    const { error } = await requestAdminPasswordRecovery(client.auth, "owner@example.com");
    assert.equal(error?.status, 429);
});

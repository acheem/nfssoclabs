CREATE TABLE "Coupon" (
    "id"          TEXT        NOT NULL,
    "code"        TEXT        NOT NULL,
    "discountPct" INTEGER     NOT NULL,
    "maxUses"     INTEGER,
    "usedCount"   INTEGER     NOT NULL DEFAULT 0,
    "expiresAt"   TIMESTAMP(3),
    "active"      BOOLEAN     NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");

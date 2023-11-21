-- CreateTable
CREATE TABLE "TextMessage" (
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "TextMessage_pkey" PRIMARY KEY ("id")
);

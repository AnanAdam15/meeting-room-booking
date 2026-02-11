-- CreateTable
CREATE TABLE "booking_equipments" (
    "bookingId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "booking_equipments_pkey" PRIMARY KEY ("bookingId","equipmentId")
);

-- AddForeignKey
ALTER TABLE "booking_equipments" ADD CONSTRAINT "booking_equipments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_equipments" ADD CONSTRAINT "booking_equipments_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

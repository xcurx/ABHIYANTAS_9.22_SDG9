-- AddForeignKey
ALTER TABLE "StageSubmission" ADD CONSTRAINT "StageSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

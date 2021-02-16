import { forwardRef, Module } from '@nestjs/common';
import { DiaryModule } from 'src/diary/diary.module';
import { DiaryShareService } from './diary-share.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Share as DiaryShareMongo, ShareSchema } from './diary-share.scheme';

ShareSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

ShareSchema.set('toJSON', {
  virtuals: true,
});

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DiaryShareMongo.name, schema: ShareSchema },
    ]),
    forwardRef(() => DiaryModule),
  ],
  controllers: [],
  providers: [DiaryShareService],
  exports: [DiaryShareService],
})
export class DiaryShareModule {}

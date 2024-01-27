import mongoose from 'mongoose';
var commentsSchema, commentModel;

try {
		
    commentsSchema = new mongoose.Schema ({
        gsx$refID: { type: mongoose.ObjectId, ref: 'business', required: true },
        gsx$userName: { type: String, required: true, minLength: 2, }, 
        gsx$comment: { type: String, required: true, minLength: 5, maxLength: 240,  },
        gsx$date: { type: Date, required: true,default:Date.now}, 
        gsx$active: { type: Boolean, required: true },
    });
    
    commentModel = mongoose.model ("comments", commentsSchema);

}
catch (e) { console.log (e) }
export {commentModel as comment}

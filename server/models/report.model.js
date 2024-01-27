import mongoose from 'mongoose';
var reportSchema, reportModel;
try {
		
    reportSchema = new mongoose.Schema ({
        gsx$refId: { type: mongoose.ObjectId, ref: 'business', required: true},
        gsx$desc: { type: String, minLength: 5, maxLength: 240, required: true },  
    });
    reportModel = mongoose.model ("reports", reportSchema);

}
catch (e) { console.log (e) }
export {reportModel}

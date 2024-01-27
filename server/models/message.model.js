import mongoose from 'mongoose';
var messagesSchema, messagesModel;

try {
		
    messagesSchema = new mongoose.Schema ({
        gsx$title: { type: String, required: false  },
        gsx$sendersName: { type: String, required: false  },
        gsx$contactPhone: { type: String, required: false  },  
        gsx$contactEmail: { type: String, required: false  },  
        gsx$message: { type: String, required: true  },   
    });
    
    //messagesSchema.plugin(uniqueValidator, 'Error, expected {PATH} to be unique.');     
    messagesModel = mongoose.model ("messages", messagesSchema);

}
catch (e) { console.log (e) }
export { messagesModel as message}
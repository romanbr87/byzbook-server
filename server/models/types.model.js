import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

var typesSchema, typesModel; 

try {
    typesSchema = new mongoose.Schema ({
        gsx$type: { 
            type: String, 
            unique : true, 
            required : true 
        }
    });

    typesSchema.plugin(uniqueValidator, 'Error, expected {PATH} to be unique.');  
    typesModel = mongoose.model('businesstypes', typesSchema);
}

catch (e) { console.log (e) }

export {typesModel as types};

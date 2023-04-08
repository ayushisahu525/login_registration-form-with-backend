const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const employeeSchema = new mongoose.Schema({ 
    firstname: { 
        type: String,
        required: true,
    },
    lastname: { 
        type: String,
        required: true,
    },
    email: { 
        type: String,
        required: true,
        unique:true
    },
    gender: { 
        type: String,
        required: true,
    },

    phone: { 
        type: Number,
        required: true,
        unique:true
    },

    age: { 
        type: Number,
        required: true,
    },

    password: { 
        type: String,
        required: true,
    },

    confirmpassword: { 
        type: String,
        required: true
    },
    tokens: [{
        token:{
            type: String,
            required: true
        }
    }]
})
//instance ke sath method use hota h or collection k sath static
//generating tokens

employeeSchema.methods.generateAuthToken = async function(){
    try {
       console.log(this._id);
       const token = await jwt.sign({_id: this._id.toString()},process.env.SECRET_KEY);   //mynameisayushisahu ye hmara secretkey h ye kisi ko bhi visible hoga to ye hide krne ke liye hum .env file me daalenge
       this.tokens = this.tokens.concat({token: token}) //database me tokens naam se save ho jayega 
       await this.save();
       return token;
    } catch (error) {
        res.send("the error part" + error);
        console.log("the error part" + error);
    }
}



//password jb bhejne ki bari aay database me uske bad ye run karo fir next() mtlb iske bad iske bad wala code run karo
//converting password into hash
employeeSchema.pre("save", async function(next){

    if(this.isModified("password")){  //jb pasword wali field update ho tbhi ye ho
        // const passwordHash = await bcrypt.hash(password, 10);
        // console.log(`the current password is ${this.password}`);
        this.password = await bcrypt.hash(this.password, 10);
         //waps se password update ho jayega
        this.confirmpassword = await bcrypt.hash(this.password, 10);
        // console.log(`the current password is ${this.password}`);

        // this.confirmpassword = undefined;  //kyuki confirm password ki need nhi hai isliye ye save na ho database me to bhi chal jayega

    }
    
    next();

})
    

//we will create new collection
const Register = new mongoose.model("Register", employeeSchema);
module.exports = Register;
const mongoose = require("mongoose");

// This schema is for the report for each uploads and users activity
const ReportSchema = new mongoose.Schema(
    {
        // This is for the reports send by the users for the uploads and users activity
        trackedId: { type: mongoose.Schema.Types.ObjectId, ref: "Tracker", required: true },
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  
        reason: { type: String, required: true },
        // Here enum is used to define the status of the report, it can be either "open" or "resolved"
        status: { type: String, enum: ["open", "resolved"], default: "open" }, 
    }, {
        timestamps: true
    }
); 


module.exports = mongoose.model("Report", ReportSchema);

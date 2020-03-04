const mongoose = require('mongoose');


Company = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    siret: {
        type: Number,
        unique: true,
        required: true
    },
    siren: {
        type: Number,
        required: true
    },
    ape: {
        type: String,
        required: true
    },
    activity: {
        type: String
    },
    address: {
        type: String
    },
    data: {
        type: [{
                year: { type: Number },
                ca: { type: Number },
                results: { type: Number },
                effectif: { type: Number },
                ratioCaResults: { type: Number },
            }]
    }
});

module.exports = mongoose.model('Company', Company);

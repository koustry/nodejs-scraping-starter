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
        type: {
            year:  { type: [{
                year: {type: Number},
                ca: {type: Number},
                caFormatted: {type: String},
                caFormattedReduced: {type: String},
                results: {type: Number},
                resultsFormatted: {type: String},
                resultsFormattedReduced: {type: String},
                effectif: {type: Number},
                effectifFormatted: {type: Number},
                effectifFormattedReduced: {type: Number},
                ratioCaResults: {type: String},
                ratioCaResultsFormatted: {type: String}
            }]}
          }
    }
});

module.exports = mongoose.model('Company', Company);

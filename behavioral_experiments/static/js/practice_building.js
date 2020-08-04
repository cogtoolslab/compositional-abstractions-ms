var BlockUniverse = require('./experimentEnvironment.js');
var Confetti = require('./confetti.js');
var stim = require('./stimList.js');
var scoring = require('./scoring.js');
var _ = require('lodash');

window.onload = function(){
  var customConfig = require('../../config.json');
  practiceUI = new PracticeUI();
  practiceUI.reset();
};

class PracticeUI {
  // Since all the action is happening in experimentEnvironment, this
  // is basically a glorified wrapper
  constructor() {
    this.blockUniverse = new BlockUniverse();
    this.confetti = new Confetti(300);
    this.targetBlocks = stim.makeBuildPracticeScene();
    this.targetMap = scoring.getDiscreteWorld(this.targetBlocks);
    this.blockNum = 0;
    this.failedAttempts = 0;

    this.practiceStim = {
        targetBlocks: this.targetBlocks
      };
    this.blocksInStructure = this.targetBlocks.length;
    console.log(this.blocksInStructure);
    this.blockUniverse.blockSender = function (blockData) {}

    // this.blockUniverse.blockSender = function (blockData) {
    //     console.log(this.blockNum);
    //     if (this.sendingBlocks == this.blocksInStructure) {
    //         //resetTimer(game, 30, document.getElementById('timer');
    //         $('#done-button').prop('disabled', !game.speakerTurn);
    //         this.blockUniverse.disabledBlockPlacement = true;
    //         var trialScore = parseInt(scoring.getScoreDiscrete(this.targetMap, scoring.getDiscreteWorld(this.blockUniverse.sendingBlocks)));
    //         console.log(trialScore);
    //     }
    // };

    $("#done-button").click(() => {
        var trialScore = parseInt(scoring.getScoreDiscrete(this.targetMap, scoring.getDiscreteWorld(this.blockUniverse.sendingBlocks)));
        console.log('score', trialScore);
        if(trialScore < 100){
            this.failedAttempts += 1;
            // update attempts remaining
            if(this.failedAttempts > 3){
                location.replace("./fail.html");
            } else {
                this.reset();
            }
        }
        else{
            location.replace("./../../index.html");
            console.log('success!');
        }
        // This prevents the form from submitting & disconnecting person
        return false;
      });

  }

  reset() {
    // Need to remove old screens
    if(_.has(this.blockUniverse, 'p5env') ||
       _.has(this.blockUniverse, 'p5stim')) {
      this.blockUniverse.removeEnv();
      this.blockUniverse.removeStimWindow();
    }
    this.blockUniverse.sendingBlocks = [];

    this.confetti.reset();

    this.blockNum = 0;
    
    this.targetMap = scoring.getDiscreteWorld(this.targetBlocks); // Add discrete map for scoring
    this.blockUniverse.setupEnvs(this.practiceStim);

   
    // Update counters
    // $("#block-counter").text('0/' + 2 + ' blocks placed'); //hardcoded for now
    // $("#score-counter").text('Total bonus: $' + String(game.cumulativeBonus.toFixed(2)));
    // if(game.trialNum === 'practice') {
    //   $("#trial-counter").text("Practice building the tower!");
    // } else {
    //   $("#trial-counter").text('trial ' + (game.trialNum + 1) + '/12');
    // }
    // $("#story").empty();
    // $("#response-form").show();
    // $("#send-message").prop("disabled", false);
    // $('#reproduction').prop('disabled', false);
    // $('#done-button').prop('disabled', true);
    // $("#send-message").html("Send");
    // $("#reproduction").focus();
  }

//   submit (event) {
//     $('#button_error').show();
//     var game = event.data.game;
//     game.data = _.extend(game.data, {
//       'comments' : $('#comments').val().trim().replace(/\./g, '~~~'),
//       'strategy' : $('#strategy').val().trim().replace(/\./g, '~~~'),
//       'role' : game.role,
//       'score' : parseInt(game.cumulativeBonus * 100),
//       'totalLength' : Date.now() - game.startTime
//     });
//     game.submitted = true;
//     console.log("data is...");
//     console.log(game.data);
//     game.socket.send("exitSurvey." + JSON.stringify(game.data));
//     if(_.size(game.urlParams) >= 4) {
//       window.opener.turk.submit(game.data, true);
//       window.close(); 
//     } else {
//       console.log("would have submitted the following :")
//       console.log(game.data);
//     }
//   }
}
$(function() {
  const config = {
    apiKey: "AIzaSyBJ9spM0Gq02Jrq55TutDHVSDXKVW_mlfc",
    authDomain: "asamadesoreseikai.firebaseapp.com",
    databaseURL: "https://asamadesoreseikai.firebaseio.com",
    storageBucket: "asamadesoreseikai.appspot.com",
  };
  firebase.initializeApp(config);

  const db = firebase.database();

  const dbQuestion = db.ref('/question');
  dbQuestion.on("value", function(snapshot) {
    if(nowOdaiText != null) {
      playSound(dededenSE);
      resultEventFlag = false;
    }
    nowOdaiText = snapshot.val();
    const $odaiText = $('#odaitext');
    $odaiText.val(nowOdaiText).trigger('keyup');

    $('.fa-heart, .fa-poop').show();
    $('.fa-crown, .fa-poo').hide();
    $('.judge').empty();
  });

  const dbResultDisp = db.ref('/result_disp');
  dbResultDisp.on("value", function(snapshot) {
    if(snapshot.val()) {
      $('.fa-heart, .fa-poop').hide();

      const goodSumList = [];
      const badSumList = [];

      const dbJudge = db.ref('/user_list');
      dbJudge.once('value', function(snapshot) {
        const userList = snapshot.val();

        for(let userId = 0; userId < 8; userId++) {
          let sum = 0;
          const goodList = userList["user" + userId].judge.good;
          for(let fromId = 0; fromId < 8; fromId++) {
            sum += (goodList["from" + fromId])?1:0;
          }
          goodSumList.push(sum);

          sum = 0;
          const badList = userList["user" + userId].judge.bad;
          for(let fromId = 0; fromId < 8; fromId++) {
            sum += (badList["from" + fromId])?1:0;
          }
          badSumList.push(sum);
        }

        resultEvent(goodSumList, badSumList);
      });

    }
  });

  const resultEvent = function(goodSumList, badSumList) {
    resultEventFlag = true;
    playLoopSound(dramSE);

    dramroll(goodSumList, badSumList, 0);
  }

  const dramroll = function(goodSumList, badSumList, num) {
    if(!resultEventFlag) {
      return;
    }

    let max = 0;
    for(let userId = 0; userId < 8; userId++) {
      const goodNum = goodSumList[userId];
      const badNum = badSumList[userId];

      if(goodNum > max) { max = goodNum }
      if(badNum > max) { max = badNum }

      if(num > 0 && num <= goodNum) {
        const $goodIcon = $('<i class="fas fa-heart fa-2x pink"></i>');
        $goodIcon.css('top', 310 - num*35);
        const $judge = $('.user[data-id="' + userId + '"] .judge_good');
        $judge.append($goodIcon);
      }

      if(num > 0 && num <= badNum) {
        const $badIcon = $('<i class="fas fa-poop fa-2x brown"></i>');
        $badIcon.css('top', 310 - num*35);
        const $judge = $('.user[data-id="' + userId + '"] .judge_bad');
        $judge.append($badIcon);
      }
    }

    if(num >= max + 1) {
      const scoreList = [];
      let maxScore = 0;
      let minScore = 100;

      for(let userId = 0; userId < 8; userId++) {
        const goodNum = goodSumList[userId];
        const badNum = badSumList[userId];
        const score = goodNum*2 - badNum;
        scoreList.push(score);

        if(score > maxScore) { maxScore = score; }
        if(score < minScore) { minScore = score; }
      }
      playSound(dramendSE);

      window.setTimeout(function() {
        dsipWInnerEvent(scoreList, maxScore, minScore);
      }, 1000);
      return;
    }

    window.setTimeout(function() {
      dramroll(goodSumList, badSumList, num + 1);
    }, 400);
  }

  const dsipWInnerEvent = function(scoreList, maxScore, minScore) {
    playSound(fanfareSE);
    console.log(scoreList);
    console.log(maxScore);
    console.log(minScore);
    for(let userId = 0; userId < 8; userId++) {
      if(scoreList[userId] == maxScore) {
        const $crown = $('.user[data-id='+userId+'] .fa-crown');
        $crown.show();
      } else if(scoreList[userId] == minScore) {
        const $poo = $('.user[data-id='+userId+'] .fa-poo');
        $poo.show();
      }
    }
  }

  for(let id = 0; id < 8; id++) {
    const dbAnswer = db.ref('/user_list/user' + id + '/answer');
    dbAnswer.on("value", function(snapshot) {
      const answerText = snapshot.val();
      const $user = $('.user[data-id="' + id + '"]');
      const $panel = $user.find('.panel');
      const $panelText = $user.find('.panel > p');
      $panelText.text(answerText);
      if(answerText != "") {
        playSeSound(dedenSE);
        $panel.addClass('open');
      } else {
        $panel.removeClass('open');
      }
    });

    const dbName = db.ref('/user_list/user' + id + '/name');
    dbName.on("value", function(snapshot) {
      const answerText = snapshot.val();
      const $user = $('.user[data-id="' + id + '"]');
      const $nameText = $user.find('.name > p');
      $nameText.text(answerText);
    });

    for(let fromId = 0; fromId < 8; fromId++) {
      const dbGood = db.ref('/user_list/user' + id + '/judge/good/from' + fromId);
      dbGood.on("value", function(snapshot) {
        const $selectUser = $('.user.selected');
        if($selectUser.length != 1) {
          return;
        }
        const myId = $selectUser.data('id');
        if(myId != fromId) {
          return;
        }

        const $heart = $('.user[data-id='+id+'] .name .fa-heart');
        if(snapshot.val()) {
          $heart.removeClass('gray');
          $heart.addClass('pink');
        } else {
          $heart.removeClass('pink');
          $heart.addClass('gray');
        }
      });

      const dbBad = db.ref('/user_list/user' + id + '/judge/bad/from' + fromId);
      dbBad.on("value", function(snapshot) {
        const $selectUser = $('.user.selected');
        if($selectUser.length != 1) {
          return;
        }
        const myId = $selectUser.data('id');
        if(myId != fromId) {
          return;
        }

        const $poop = $('.user[data-id='+id+'] .name .fa-poop');
        if(snapshot.val()) {
          $poop.removeClass('gray');
          $poop.addClass('brown');
        } else {
          $poop.removeClass('brown');
          $poop.addClass('gray');
        }
      });
    }
  }

  $('.panel').on('click', function() {
    $user = $(this).parent('.user');
    if($user.hasClass('selected')) {
      return;
    }
    const name = window.prompt("ユーザー名", "");

    if(name != "" && name != null) {
      const id = $user.data('id');

      $('.user').removeClass('selected');
      $user.addClass('selected');

      const dbName = db.ref('/user_list/user' + id + '/name');
      const dbAnswer = db.ref('/user_list/user' + id + '/answer');

      dbName.set(name);
      dbAnswer.set("");

      for(let userId = 0; userId < 8; userId++) {
        const dbGood = db.ref('/user_list/user' + userId + '/judge/good/from' + id);
        dbGood.once("value", function(snapshot) {
          const $heart = $('.user[data-id='+userId+'] .name .fa-heart');
          if(snapshot.val()) {
            $heart.removeClass('gray');
            $heart.addClass('pink');
          } else {
            $heart.removeClass('pink');
            $heart.addClass('gray');
          }
        });

        const dbBad = db.ref('/user_list/user' + userId + '/judge/bad/from' + id);
        dbBad.once("value", function(snapshot) {
          const $poop = $('.user[data-id='+userId+'] .name .fa-poop');
          if(snapshot.val()) {
            $poop.removeClass('gray');
            $poop.addClass('brown');
          } else {
            $poop.removeClass('brown');
            $poop.addClass('gray');
          }
        });
      }

    } else if(name == "") {
      window.alert("ユーザー名が入力されていません");
    }
  });

  $('.title').on('click', function(e) {
    const clientX = e.pageX - $(this).offset().left;
    const centerX = $(this).outerWidth() / 2;

    if(clientX < centerX) {
      const dbResultDisp = db.ref('/result_disp');
      dbResultDisp.set(true);
    } else {
      const odaitext = $('#odaitext').val();
      if(nowOdaiText == odaitext) {
        return;
      }
      const dbQuestion = db.ref('/question');
      dbQuestion.set(odaitext);

      const dbResultDisp = db.ref('/result_disp');
      dbResultDisp.set(false);

      for(let userId = 0; userId < 8; userId++) {
        const dbAnswer = db.ref('/user_list/user' + userId + '/answer');
        dbAnswer.set("");

        for(let fromId = 0; fromId < 8; fromId++) {
          const dbGood = db.ref('/user_list/user' + userId + '/judge/good/from' + fromId);
          const dbBad = db.ref('/user_list/user' + userId + '/judge/bad/from' + fromId);

          dbGood.set(false);
          dbBad.set(false);
        }
      }
    }
  });

  $('#open_btn').on('click', function() {
    const $selectUser = $('.user.selected');
    if($selectUser.length != 1) {
      window.alert('フリップを選択してください');
      return;
    }
    const answer = $('#answer_input').val();
    if(answer == "" || answer == null) {
      window.alert('回答を入力してください');
      return;
    }

    const id = $selectUser.data('id');

    const dbAnswer = db.ref('/user_list/user' + id + '/answer');
    dbAnswer.set(answer);
  });

  $('#reset_btn').on('click', function() {
    const $selectUser = $('.user.selected');
    if($selectUser.length != 1) {
      window.alert('フリップを選択してください');
      return;
    }
    const id = $selectUser.data('id');

    const dbAnswer = db.ref('/user_list/user' + id + '/answer');
    dbAnswer.set("");
    $('#answer_input').val("");
  });

  $(window).on('resize', function() {
    $('#odaitext').trigger('keyup');
  });

  $('#odaitext').keyup(function() {
    $(this).css('height', 'auto');
    const height = $(this)[0].scrollHeight;
    $(this).css('height', height);
  });

  $('.fa-heart').on('click', function() {
    const $selectUser = $('.user.selected');
    if($selectUser.length != 1) {
      window.alert('フリップを選択してください');
      return;
    }
    const myId = $selectUser.data('id');
    const userId = $(this).parents('.user').data('id');
    const dbGood = db.ref('/user_list/user' + userId + '/judge/good/from' + myId);
    if($(this).hasClass('gray')) {
      dbGood.set(true);
      playSeSound(goodSE);
    } else {
      dbGood.set(false);
    }

    const $poop = $('.user[data-id='+userId+'] .fa-poop');
    const dbBad = db.ref('/user_list/user' + userId + '/judge/bad/from' + myId);
    if($poop.hasClass('brown')) {
      dbBad.set(false);
    }
  });

  $('.fa-poop').on('click', function() {
    const $selectUser = $('.user.selected');
    if($selectUser.length != 1) {
      window.alert('フリップを選択してください');
      return;
    }
    const myId = $selectUser.data('id');
    const userId = $(this).parents('.user').data('id');
    const dbBad = db.ref('/user_list/user' + userId + '/judge/bad/from' + myId);
    if($(this).hasClass('gray')) {
      dbBad.set(true);
      playSeSound(badSE);
    } else {
      dbBad.set(false);
    }

    const $heart = $('.user[data-id='+userId+'] .fa-heart');
    const dbGood = db.ref('/user_list/user' + userId + '/judge/good/from' + myId);
    if($heart.hasClass('pink')) {
      dbGood.set(false);
    }
  });
});

let nowOdaiText = null;
let resultEventFlag = false;

let dedenSE, dededenSE;
let dramSE, dramendSE, fanfareSE;
let goodSE, badSE;
$(window).on('mousedown touchdown', function() {
  initWebAPI();

  loadSound("deden.wav", function(bufferData) {
    dedenSE = bufferData;
  });

  loadSound("dededen.wav", function(bufferData) {
    dededenSE = bufferData;
  });

  loadSound("dram.wav", function(bufferData) {
    dramSE = bufferData;
  });

  loadSound("dramend.wav", function(bufferData) {
    dramendSE = bufferData;
  });

  loadSound("fanfare.wav", function(bufferData) {
    fanfareSE = bufferData;
  });

  loadSound("iine.wav", function(bufferData) {
    goodSE = bufferData;
  });

  loadSound("bcp.wav", function(bufferData) {
    badSE = bufferData;
  });

  $(window).off('mousedown touchdown');
});

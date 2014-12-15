// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Mongo.Collection("players");

if (Meteor.isClient) {
  var options = { sort: { score: -1, name: 1 } };
  var playersSub = Meteor.subscribe('players', options);

  Template.leaderboard.rendered = function() {
    var _this = this;
    // XXX : what is autorun?!
    this.autorun(function(c) {
      if (playersSub.ready() > 0) {
        var owl = _this.$(".owl-carousel");
        owl.owlCarousel({
          items: 2
        });
        c.stop();
      }
    });
  };

  Template.leaderboard.helpers({
    // XXX : if I use subscribe I assume I don't need this. but how can I remove this gracefully.
    players: function () {
      return Players.find({}, options);
    },
    selectedName: function () {
      var player = Players.findOne(Session.get("selectedPlayer"));
      return player && player.name;
    }
  });

  Template.leaderboard.events({
    'click .inc': function () {
      Players.update(Session.get("selectedPlayer"), {$inc: {score: 5}});
    }
  });

  Template.player.helpers({
    selected: function () {
      return Session.equals("selectedPlayer", this._id) ? "selected" : '';
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selectedPlayer", this._id);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace", "Grace Hopper", "Marie Curie",
                   "Carl Friedrich Gauss", "Nikola Tesla", "Claude Shannon"];
      _.each(names, function (name) {
        Players.insert({
          name: name,
          score: Math.floor(Random.fraction() * 10) * 5
        });
      });
    }
  });
  Meteor.publish('players', function(options) {
    return Players.find({}, options);
  });
}

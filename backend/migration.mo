import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type OldActor = {
    bans : Map.Map<Principal, { #mediaBan }>;
  };

  type NewActor = {
    bannedPrincipals : Map.Map<Principal, {
      reason : Text;
      timestamp : Time.Time;
      permanent : Bool;
    }>;
  };

  public func run(old : OldActor) : NewActor {
    let newBannedPrincipals = old.bans.map<Principal, { #mediaBan }, { reason : Text; timestamp : Time.Time; permanent : Bool }>(
      func(_principal, _policy) {
        {
          reason = "Converted from old ban policy";
          timestamp = Time.now();
          permanent = true;
        };
      }
    );
    { bannedPrincipals = newBannedPrincipals };
  };
};


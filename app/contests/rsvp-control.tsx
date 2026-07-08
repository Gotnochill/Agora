import { UserStatus } from "@prisma/client";
import { cancelContestRsvp, rsvpToContest } from "./[slug]/actions";

type ContestRsvpControlProps = {
  contestSlug: string;
  userStatus?: UserStatus;
  isGoing: boolean;
};

export default function ContestRsvpControl({
  contestSlug,
  userStatus,
  isGoing,
}: ContestRsvpControlProps) {
  if (!userStatus) {
    return (
      <a className="button" href="/join">
        Sign in to RSVP
      </a>
    );
  }

  if (userStatus === UserStatus.PENDING) {
    return (
      <a className="secondary-button" href="/apply">
        Membership pending
      </a>
    );
  }

  if (userStatus !== UserStatus.ACTIVE) {
    return <p className="event-note">Only active members can RSVP.</p>;
  }

  return (
    <form action={isGoing ? cancelContestRsvp : rsvpToContest} className="inline-form">
      <input type="hidden" name="contestSlug" value={contestSlug} />
      <button className={isGoing ? "secondary-button" : "button"} type="submit">
        {isGoing ? "Cancel RSVP" : "RSVP"}
      </button>
    </form>
  );
}

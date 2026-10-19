/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewActions from "@/app/moderation/_components/reviewActions";
import { buildWork } from "@/tests/unit/shared/factories/work";

describe("ReviewActions", () => {
  it("passes the entered refusal reason with the selected work", async () => {
    const work = buildWork({ id: 17 });
    const onRefuse = jest.fn();
    render(
      <ReviewActions
        work={work}
        accepting={false}
        refusing={false}
        onAccept={jest.fn()}
        onRefuse={onRefuse}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Refuser" }));
    await userEvent.type(screen.getByLabelText("Motif (optionnel)"), "Hors sujet");
    await userEvent.click(
      screen.getByRole("button", { name: "Confirmer le refus" }),
    );

    expect(onRefuse).toHaveBeenCalledWith(work, "Hors sujet");
  });
});

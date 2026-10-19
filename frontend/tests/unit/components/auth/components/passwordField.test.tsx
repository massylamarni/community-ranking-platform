/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordField } from "@/app/auth/_components/passwordField";

describe("PasswordField", () => {
  it("toggles password visibility and forwards input changes", async () => {
    const onChange = jest.fn();
    render(
      <PasswordField
        id="password"
        label="Mot de passe"
        value=""
        onChange={onChange}
      />,
    );

    const input = screen.getByLabelText("Mot de passe") as HTMLInputElement;
    expect(input.type).toBe("password");

    await userEvent.click(
      screen.getByRole("button", { name: "Afficher le mot de passe" }),
    );
    expect(input.type).toBe("text");

    await userEvent.type(input, "x");
    expect(onChange).toHaveBeenCalledWith("x");
    await userEvent.click(
      screen.getByRole("button", { name: "Masquer le mot de passe" }),
    );
    expect(input.type).toBe("password");
  });
});

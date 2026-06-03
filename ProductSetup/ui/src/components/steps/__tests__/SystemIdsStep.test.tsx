import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SystemIdsStep } from "../SystemIdsStep";
import { EXTERNAL_SYSTEMS } from "@/types/product";

const mockOnUpdateSystem = jest.fn();

const createDefaultExternalSystems = () =>
  EXTERNAL_SYSTEMS.map((system) => ({ system, id: "", name: "" }));

const defaultProps = {
  externalSystems: createDefaultExternalSystems(),
  onUpdateSystem: mockOnUpdateSystem,
};

describe("SystemIdsStep", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the External System Mappings heading", () => {
    render(<SystemIdsStep {...defaultProps} />);
    
    expect(screen.getByText("External System Mappings")).toBeInTheDocument();
  });

  it("renders all external system labels", () => {
    render(<SystemIdsStep {...defaultProps} />);
    
    EXTERNAL_SYSTEMS.forEach((systemName) => {
      expect(screen.getByLabelText(`${systemName} - ID`)).toBeInTheDocument();
      expect(screen.getByLabelText(`${systemName} - Name (Optional)`)).toBeInTheDocument();
    });
  });

  it("renders correct number of input pairs", () => {
    render(<SystemIdsStep {...defaultProps} />);
    
    const idInputs = screen.getAllByPlaceholderText("Enter system ID");
    const nameInputs = screen.getAllByPlaceholderText("Enter system name");
    
    expect(idInputs.length).toBe(EXTERNAL_SYSTEMS.length);
    expect(nameInputs.length).toBe(EXTERNAL_SYSTEMS.length);
  });

  it("calls onUpdateSystem when typing in ID field", async () => {
    const user = userEvent.setup();
    render(<SystemIdsStep {...defaultProps} />);
    
    const firstIdInput = screen.getByLabelText(`${EXTERNAL_SYSTEMS[0]} - ID`);
    await user.type(firstIdInput, "A");
    
    expect(mockOnUpdateSystem).toHaveBeenCalledWith(0, "id", "A");
  });

  it("calls onUpdateSystem when typing in Name field", async () => {
    const user = userEvent.setup();
    render(<SystemIdsStep {...defaultProps} />);
    
    const firstNameInput = screen.getByLabelText(`${EXTERNAL_SYSTEMS[0]} - Name (Optional)`);
    await user.type(firstNameInput, "T");
    
    expect(mockOnUpdateSystem).toHaveBeenCalledWith(0, "name", "T");
  });

  it("displays pre-filled values for ID", () => {
    const externalSystems = createDefaultExternalSystems();
    externalSystems[0] = { system: EXTERNAL_SYSTEMS[0], id: "SYS123", name: "" };
    
    render(<SystemIdsStep externalSystems={externalSystems} onUpdateSystem={mockOnUpdateSystem} />);
    
    expect(screen.getByDisplayValue("SYS123")).toBeInTheDocument();
  });

  it("displays pre-filled values for Name", () => {
    const externalSystems = createDefaultExternalSystems();
    externalSystems[0] = { system: EXTERNAL_SYSTEMS[0], id: "", name: "Test Name" };
    
    render(<SystemIdsStep externalSystems={externalSystems} onUpdateSystem={mockOnUpdateSystem} />);
    
    expect(screen.getByDisplayValue("Test Name")).toBeInTheDocument();
  });

  it("handles multiple system updates", async () => {
    const user = userEvent.setup();
    render(<SystemIdsStep {...defaultProps} />);
    
    const secondIdInput = screen.getByLabelText(`${EXTERNAL_SYSTEMS[1]} - ID`);
    await user.type(secondIdInput, "B");
    
    expect(mockOnUpdateSystem).toHaveBeenCalledWith(1, "id", "B");
  });

  it("renders with all systems filled", () => {
    const externalSystems = EXTERNAL_SYSTEMS.map((system, index) => ({
      system,
      id: `ID${index}`,
      name: `Name${index}`,
    }));
    
    render(<SystemIdsStep externalSystems={externalSystems} onUpdateSystem={mockOnUpdateSystem} />);
    
    EXTERNAL_SYSTEMS.forEach((_, index) => {
      expect(screen.getByDisplayValue(`ID${index}`)).toBeInTheDocument();
      expect(screen.getByDisplayValue(`Name${index}`)).toBeInTheDocument();
    });
  });

  it("applies proper styling to the container", () => {
    const { container } = render(<SystemIdsStep {...defaultProps} />);
    
    expect(container.querySelector(".bg-card")).toBeInTheDocument();
    expect(container.querySelector(".border")).toBeInTheDocument();
  });
});

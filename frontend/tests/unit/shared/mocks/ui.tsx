import React from "react";

export const mockConfirmDialog = jest.fn();

type ConfirmDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onOpenChange: (o: boolean) => void;
  loading: boolean;
  error: unknown;
};

export const confirmDialogModule = {
  ConfirmDialog: (props: ConfirmDialogProps) => {
    mockConfirmDialog(props);
    return props.open ? (
      <div data-testid="confirm-dialog">
        <button onClick={props.onConfirm}>confirm</button>
        <button onClick={() => props.onOpenChange(false)}>cancel</button>
      </div>
    ) : null;
  },
};

export const lastConfirmDialogProps = () =>
  mockConfirmDialog.mock.calls[
    mockConfirmDialog.mock.calls.length - 1
  ][0] as ConfirmDialogProps;

export const headerPortalModule = {
  HeaderPortal: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="header">{children}</div>
  ),
};

export const noCategoryModule = {
  __esModule: true,
  default: () => <div data-testid="no-category" />,
};

export const linkModule = {
  __esModule: true,
  default: ({
    href,
    children,
  }: {
    href: string;
    children?: React.ReactNode;
  }) => <a href={href}>{children}</a>,
};

export const buttonModule = {
  Button: ({
    render,
    children,
  }: {
    render?: React.ReactElement;
    children?: React.ReactNode;
  }) =>
    render ? (
      React.cloneElement(render, {}, children)
    ) : (
      <button>{children}</button>
    ),
};

export const dialogModule = {
  Dialog: ({
    open,
    onOpenChange,
    children,
  }: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    children?: React.ReactNode;
  }) =>
    open ? (
      <div data-testid="dialog">
        <button
          data-testid="close-dialog"
          onClick={() => onOpenChange(false)}
        />
        {children}
      </div>
    ) : null,
  DialogContent: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
};

export const mockUploadFile = new File(["x"], "work.png", {
  type: "image/png",
});

export const attachmentUploaderModule = {
  AttachmentUploader: ({
    onFileSelect,
  }: {
    onFileSelect: (f: File | null) => void;
  }) => (
    <button
      type="button"
      data-testid="uploader"
      onClick={() => onFileSelect(mockUploadFile)}
    >
      upload
    </button>
  ),
};

export const scrollAreaModule = {
  ScrollArea: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
};

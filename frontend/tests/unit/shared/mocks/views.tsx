import React from "react";
import type { Work } from "@/types/api";
import { WorkFormData } from "@/app/works/_components/workEdit";

export const mockCategoryView = jest.fn();

type CategoryViewProps = {
  categoryId: number;
  onCategoryChange: (id: string) => void;
};

export const categoryViewModule = {
  __esModule: true,
  default: (props: CategoryViewProps) => {
    mockCategoryView(props);
    return <div data-testid="category-view" />;
  },
};

export const lastCategoryViewProps = () =>
  mockCategoryView.mock.calls[
    mockCategoryView.mock.calls.length - 1
  ][0] as CategoryViewProps;

export const mockWorkList = jest.fn();
export const mockWorkItem = jest.fn();
export const mockFilterBar = jest.fn();

type WorkListProps = {
  works: Work[];
  username?: string;
  setWorks: unknown;
  setSelectedWork: (w: Work | null) => void;
};
type WorkItemProps = { work: Work | null; setWork?: (w: Work) => void };
type FilterBarProps = {
  categories: unknown[];
  categoryId: string;
  setCategoryId: (id: string) => void;
};

export const workListModule = {
  WorkList: (props: WorkListProps) => {
    mockWorkList(props);
    return <div data-testid="work-list" />;
  },
};

export const workItemModule = {
  WorkItem: (props: WorkItemProps & { children?: React.ReactNode }) => {
    mockWorkItem(props);
    return <div data-testid="work-item">{props.children}</div>;
  },
};

export const filterBarModule = {
  __esModule: true,
  default: (props: FilterBarProps) => {
    mockFilterBar(props);
    return (
      <button
        data-testid="filter-bar"
        onClick={() => props.setCategoryId("5")}
      />
    );
  },
};

const last = <T,>(m: jest.Mock) =>
  m.mock.calls[m.mock.calls.length - 1][0] as T;
export const lastWorkListProps = () => last<WorkListProps>(mockWorkList);
export const lastWorkItemProps = () => last<WorkItemProps>(mockWorkItem);
export const lastFilterBarProps = () => last<FilterBarProps>(mockFilterBar);

export const mockWorkEdit = jest.fn();

type WorkEditProps = {
  work: Work;
  categories: unknown[];
  initialError: unknown;
  handleSave: (data: {
    title: string;
    description: string;
    image: File | null;
  }) => Promise<unknown>;
  handlePublish: (data: WorkFormData) => Promise<void>;
  handleRemove: () => Promise<void>;
};

export const workEditModule = {
  WorkEdit: (props: WorkEditProps) => {
    mockWorkEdit(props);
    return <div data-testid="work-edit" />;
  },
};

export const lastWorkEditProps = () => last<WorkEditProps>(mockWorkEdit);

export const noWorkModule = {
  __esModule: true,
  default: () => <div data-testid="no-work" />,
};

export const worksContainerModule = {
  WorksContainer: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="container">{children}</div>
  ),
};

export const workItemPropsFor = (id: number) =>
  mockWorkItem.mock.calls
    .map((c) => c[0] as WorkItemProps)
    .find((p) => p.work?.id === id)!;

export const noPersonalWorkModule = {
  __esModule: true,
  default: () => <div data-testid="no-personal-work" />,
};
export const filterHasNoWorkModule = {
  __esModule: true,
  default: () => <div data-testid="filter-has-no-work" />,
};

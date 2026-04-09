import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TaskCard from '../../components/TaskCard'

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
  },
}))

// Mock the store
const mockEditTask = vi.fn()
const mockRemoveTask = vi.fn()

vi.mock('../../store/useStore', () => ({
  useTaskStore: () => ({
    editTask: mockEditTask,
    removeTask: mockRemoveTask,
  }),
}))

// Wrapper component for router
function TaskCardWrapper(props) {
  return (
    <BrowserRouter>
      <TaskCard {...props} />
    </BrowserRouter>
  )
}

describe('TaskCard Component', () => {
  const defaultProps = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    created_at: '2026-04-09T10:00:00Z',
  }

  beforeEach(() => {
    mockEditTask.mockClear()
    mockRemoveTask.mockClear()
    window.confirm = vi.fn(() => true)
  })

  it('renders task card with title and description', () => {
    render(<TaskCardWrapper {...defaultProps} />)

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('shows "No description" when description is null', () => {
    render(<TaskCardWrapper {...defaultProps} description={null} />)

    expect(screen.getByText('No description')).toBeInTheDocument()
  })

  it('displays "Uncompleted" status when task is not completed', () => {
    render(<TaskCardWrapper {...defaultProps} completed={false} />)

    expect(screen.getByText('Uncompleted')).toBeInTheDocument()
  })

  it('displays "Completed" status when task is completed', () => {
    render(<TaskCardWrapper {...defaultProps} completed={true} />)

    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('displays formatted date', () => {
    render(<TaskCardWrapper {...defaultProps} />)

    const formattedDate = new Date('2026-04-09T10:00:00Z').toLocaleDateString()
    expect(screen.getByText(formattedDate)).toBeInTheDocument()
  })

  it('shows "No date" when created_at is null', () => {
    render(<TaskCardWrapper {...defaultProps} created_at={null} />)

    expect(screen.getByText('No date')).toBeInTheDocument()
  })

  it('toggles task completion when clicked', () => {
    const { container } = render(<TaskCardWrapper {...defaultProps} />)

    const button = container.querySelector('button[type="button"]')
    fireEvent.click(button)

    expect(mockEditTask).toHaveBeenCalledWith({ completed: true }, 1)
  })

  it('deletes task when delete button is clicked and confirmed', () => {
    const { container } = render(<TaskCardWrapper {...defaultProps} />)

    const deleteButton = container.querySelector('[aria-label="Delete task"]')
    fireEvent.click(deleteButton)

    expect(window.confirm).toHaveBeenCalled()
    expect(mockRemoveTask).toHaveBeenCalledWith(1)
  })

  it('does not delete task when deletion is cancelled', () => {
    window.confirm = vi.fn(() => false)

    const { container } = render(<TaskCardWrapper {...defaultProps} />)

    const deleteButton = container.querySelector('[aria-label="Delete task"]')
    fireEvent.click(deleteButton)

    expect(mockRemoveTask).not.toHaveBeenCalled()
  })
})

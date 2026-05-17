# TDD & Testing Patterns (AI-Ready)

This document defines the strict pattern for writing tests in this project. All code and test generation must follow these structures to ensure consistency, reliability, and ease of maintenance.

## 1. The Red-Green-Refactor Protocol
For every new feature or bug fix:
1.  **Red:** Create the test file and define the first test case. Confirm it **fails** with the expected error.
2.  **Green:** Write the **minimal** amount of code to make the test pass.
3.  **Refactor:** Clean up the code while keeping the test green, ensuring it follows the `DEV_STANDARDS.md`.

## 2. Backend Pattern (NestJS + DDD)

### Unit Testing Use Cases (Application Layer)
- **Isolation:** Always mock the Repository interface (Port).
- **Naming:** `describe('[UseCaseName]', () => { it('should [expected outcome] when [scenario]', ... ) })`
- **Structure (AAA):**
    ```typescript
    describe('CreateLeadUseCase', () => {
      it('should create a lead and save it to the repository', async () => {
        // Arrange
        const mockRepo = { save: jest.fn() };
        const useCase = new CreateLeadUseCase(mockRepo as any);
        const dto = { name: 'John Doe', email: 'john@example.com' };

        // Act
        await useCase.execute(dto);

        // Assert
        expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({
          name: 'John Doe'
        }));
      });
    });
    ```

### Unit Testing Value Objects (Domain Layer)
- **Focus:** Validation, invariants, and equality.
- **Goal:** Ensure "dirty data" never enters the domain entities.
- **Example:** Test that a `Cpf` value object throws a `DomainError` if the string is invalid.

## 3. Frontend Pattern (Next.js + RTL)

### Testing Hooks (Application Layer)
- Use `renderHook` from `@testing-library/react`.
- Focus on state transitions and API side effects.

### Testing Components (Shared UI)
- **Focus:** Accessibility (Aria-labels), Variants (CVA), and User Interaction.
- **Naming:** `describe('[ComponentName]', () => { it('should render with [variant] styles', ... ) })`
- **Structure (AAA):**
    ```tsx
    describe('Button', () => {
      it('should call onClick when clicked', () => {
        // Arrange
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click Me</Button>);
        const button = screen.getByText(/click me/i);

        // Act
        fireEvent.click(button);

        // Assert
        expect(handleClick).toHaveBeenCalledTimes(1);
      });
    });
    ```

## 4. AI-Specific Instructions
When generating code or tests, the AI must:
1.  **Analyze existing interfaces** before writing the test to ensure type safety.
2.  **Generate the test first**, confirm logic with the developer, then generate the implementation.
3.  **Automatic Edge Cases:** Always include at least one test for "sad paths" (e.g., empty inputs, invalid formats, repository failures).
4.  **Descriptive Assertions:** Use custom matchers or descriptive `it` blocks so the test suite acts as documentation.

## 5. Mocking Strategy
- **Backend:** Use simple object literals with `jest.fn()` or `jest-mock-extended`. Avoid mocking concrete classes; mock the interfaces.
- **Frontend:** Mock Axios responses or use MSW (Mock Service Worker) for integration-level tests.
- **Global:** Never let a unit test touch the actual database or external network.

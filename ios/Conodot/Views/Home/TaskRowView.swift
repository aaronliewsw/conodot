import SwiftUI

struct TaskRowView: View {
    let task: Task
    let isPlanningMode: Bool
    let onComplete: () -> Void
    let onTap: () -> Void

    @State private var isAnimating = false

    private var isStrikethrough: Bool {
        task.isCompleted || isAnimating
    }

    private var taskColor: Color {
        task.type == .signal ? Theme.chestnut : Theme.taupe
    }

    var body: some View {
        HStack(spacing: 16) {
            // Checkbox
            Button(action: handleComplete) {
                Circle()
                    .strokeBorder(
                        isPlanningMode ? Theme.silver.opacity(0.5) : taskColor,
                        lineWidth: 2
                    )
                    .frame(width: 28, height: 28)
                    .background(
                        Circle()
                            .fill(task.isCompleted || isAnimating ? Theme.chestnut : Color.clear)
                    )
                    .overlay {
                        if task.isCompleted {
                            Image(systemName: "checkmark")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(Theme.dustGrey)
                        }
                    }
                    .scaleEffect(isAnimating ? 0.95 : 1.0)
            }
            .buttonStyle(.plain)
            .disabled(task.isCompleted || isPlanningMode)

            // Task content
            VStack(alignment: .leading, spacing: 4) {
                Text(task.type.rawValue.uppercased())
                    .font(.caption.weight(.medium))
                    .tracking(0.5)
                    .foregroundColor(taskColor.opacity(isStrikethrough ? 0.5 : 1))

                Text(task.title)
                    .font(.body)
                    .foregroundColor(isStrikethrough ? Theme.taupe : Theme.chestnut)
                    .strikethrough(isStrikethrough, color: Theme.taupe)
                    .lineLimit(1)
            }
            .contentShape(Rectangle())
            .onTapGesture(perform: onTap)

            Spacer()
        }
        .padding(.vertical, 16)
        .padding(.horizontal, 12)
        .opacity(task.isCompleted ? 0.5 : 1)
        .animation(.easeOut(duration: 0.3), value: task.isCompleted)
    }

    private func handleComplete() {
        guard !task.isCompleted && !isPlanningMode && !isAnimating else { return }

        HapticFeedback.light()
        isAnimating = true

        // Brief delay for visual feedback then complete
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            HapticFeedback.success()
            onComplete()
            isAnimating = false
        }
    }
}

#Preview {
    VStack(spacing: 0) {
        TaskRowView(
            task: Task(title: "Complete project proposal", type: .signal),
            isPlanningMode: false,
            onComplete: {},
            onTap: {}
        )

        TaskRowView(
            task: Task(title: "Reply to emails", type: .noise),
            isPlanningMode: false,
            onComplete: {},
            onTap: {}
        )
    }
    .background(Theme.dustGrey)
}

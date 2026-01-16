import SwiftUI

struct TaskListView: View {
    @EnvironmentObject var appState: AppState
    @Binding var selectedTask: Task?

    // Sort tasks: incomplete first, then completed
    private var sortedTasks: [Task] {
        appState.tasks.sorted { task1, task2 in
            if task1.isCompleted == task2.isCompleted {
                return task1.createdAt < task2.createdAt
            }
            return !task1.isCompleted && task2.isCompleted
        }
    }

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                ForEach(sortedTasks, id: \.id) { task in
                    TaskRowView(
                        task: task,
                        isPlanningMode: appState.isPlanningMode,
                        onComplete: { appState.completeTask(task.id) },
                        onTap: { selectedTask = task }
                    )
                    .id("\(task.id)-\(task.isCompleted)")
                    Divider()
                        .background(Theme.silver.opacity(0.2))
                }

                // Empty state
                if appState.tasks.isEmpty {
                    EmptyTasksView(isPlanningMode: appState.isPlanningMode)
                }
            }
        }
    }
}

struct EmptyTasksView: View {
    let isPlanningMode: Bool

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "checkmark.circle")
                .font(.system(size: 48))
                .foregroundColor(Theme.silver)

            Text(isPlanningMode ? "No tasks for tomorrow" : "No tasks for today")
                .font(.headline)
                .foregroundColor(Theme.taupe)

            Text("Swipe up to add your first task")
                .font(.subheadline)
                .foregroundColor(Theme.silver)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }
}

#Preview {
    TaskListView(selectedTask: .constant(nil))
        .environmentObject(AppState())
        .background(Theme.dustGrey)
}

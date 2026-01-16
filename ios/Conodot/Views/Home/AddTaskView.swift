import SwiftUI

struct AddTaskView: View {
    @EnvironmentObject var appState: AppState
    @State private var isExpanded = false
    @State private var taskTitle = ""
    @State private var dragOffsetY: CGFloat = 0
    @State private var dragOffsetX: CGFloat = 0
    @State private var selectedType: TaskType? = nil
    @FocusState private var isFocused: Bool

    private let swipeThreshold: CGFloat = 60
    private let maxDrag: CGFloat = 120

    var body: some View {
        VStack(spacing: 0) {
            // Swipe indicator / Pull up handle
            if !isExpanded {
                swipeHandle
            }

            // Expanded input area
            if isExpanded {
                expandedContent
            }
        }
        .background(Theme.dustGrey)
        .gesture(
            DragGesture()
                .onChanged { value in
                    if !isExpanded && value.translation.height < 0 {
                        dragOffsetY = max(-maxDrag, value.translation.height)
                        dragOffsetX = value.translation.width
                        updateSelectedType()
                    }
                }
                .onEnded { value in
                    handleDragEnd(translation: value.translation)
                }
        )
        .animation(.spring(response: 0.3), value: isExpanded)
        .animation(.spring(response: 0.3), value: dragOffsetY)
    }

    private var swipeHandle: some View {
        VStack(spacing: 8) {
            // Visual indicator for swipe direction
            HStack(spacing: 24) {
                // Noise indicator (left)
                VStack(spacing: 4) {
                    Image(systemName: "arrow.up.left")
                        .font(.caption)
                    Text("Noise")
                        .font(.caption2)
                }
                .foregroundColor(
                    selectedType == .noise ? Theme.taupe : Theme.silver
                )
                .opacity(dragOffsetY < 0 ? 1 : 0.3)

                // Center handle
                Capsule()
                    .fill(Theme.silver)
                    .frame(width: 40, height: 5)
                    .offset(x: dragOffsetX * 0.3)

                // Signal indicator (right)
                VStack(spacing: 4) {
                    Image(systemName: "arrow.up.right")
                        .font(.caption)
                    Text("Signal")
                        .font(.caption2)
                }
                .foregroundColor(
                    selectedType == .signal ? Theme.chestnut : Theme.silver
                )
                .opacity(dragOffsetY < 0 ? 1 : 0.3)
            }
            .padding(.vertical, 12)

            // Current counts
            HStack(spacing: 16) {
                Text("Noise: \(appState.noiseCount)/\(TaskLimits.exactNoise)")
                    .font(.caption)
                    .foregroundColor(Theme.taupe.opacity(0.7))

                Text("Signal: \(appState.signalCount)/\(TaskLimits.maxSignal)")
                    .font(.caption)
                    .foregroundColor(Theme.chestnut.opacity(0.7))
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.bottom, 16)
        .offset(y: dragOffsetY * 0.3)
    }

    private var expandedContent: some View {
        VStack(spacing: 16) {
            // Type indicator
            HStack {
                Text(selectedType?.rawValue.uppercased() ?? "TASK")
                    .font(.caption.weight(.medium))
                    .tracking(0.5)
                    .foregroundColor(selectedType == .signal ? Theme.chestnut : Theme.taupe)

                Spacer()

                Button(action: collapse) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.title3)
                        .foregroundColor(Theme.silver)
                }
            }

            // Text input
            TextField("What do you need to do?", text: $taskTitle)
                .font(.body)
                .foregroundColor(Theme.chestnut)
                .focused($isFocused)
                .submitLabel(.done)
                .onSubmit(addTask)

            // Add button
            Button(action: addTask) {
                Text("Add Task")
                    .primaryButton()
            }
            .disabled(taskTitle.trimmingCharacters(in: .whitespaces).isEmpty)
            .opacity(taskTitle.trimmingCharacters(in: .whitespaces).isEmpty ? 0.5 : 1)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Theme.dustGrey)
                .shadow(color: .black.opacity(0.1), radius: 8, y: -4)
        )
        .onAppear {
            isFocused = true
        }
    }

    private func updateSelectedType() {
        // Must swipe up enough first
        if abs(dragOffsetY) > swipeThreshold / 2 {
            // Determine type based on horizontal direction
            // Right (positive X) = Signal, Left (negative X) = Noise
            let newType: TaskType? = if dragOffsetX > 20 {
                .signal
            } else if dragOffsetX < -20 {
                .noise
            } else {
                nil
            }

            if selectedType != newType {
                if newType != nil {
                    HapticFeedback.selection()
                }
                selectedType = newType
            }
        } else {
            selectedType = nil
        }
    }

    private func handleDragEnd(translation: CGSize) {
        if translation.height < -swipeThreshold && selectedType != nil {
            // Check if can add task
            let (allowed, _) = appState.canAddTask(selectedType!)
            if allowed {
                isExpanded = true
                HapticFeedback.medium()
            } else {
                HapticFeedback.error()
            }
        }

        dragOffsetY = 0
        dragOffsetX = 0
        if !isExpanded {
            selectedType = nil
        }
    }

    private func addTask() {
        let title = taskTitle.trimmingCharacters(in: .whitespaces)
        guard !title.isEmpty, let type = selectedType else { return }

        if appState.addTask(title: title, type: type) {
            HapticFeedback.success()
            collapse()
        } else {
            HapticFeedback.error()
        }
    }

    private func collapse() {
        isFocused = false
        taskTitle = ""
        isExpanded = false
        selectedType = nil
    }
}

#Preview {
    VStack {
        Spacer()
        AddTaskView()
    }
    .environmentObject(AppState())
    .background(Theme.dustGrey)
}

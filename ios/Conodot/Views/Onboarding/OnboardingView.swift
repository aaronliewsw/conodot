import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var appState: AppState
    @State private var currentStep = 0

    private let steps: [OnboardingStep] = [
        OnboardingStep(
            icon: "checkmark.circle.fill",
            title: "Welcome to Conodot",
            description: "A minimalist to-do app designed to help you focus on what matters most.",
            highlight: nil
        ),
        OnboardingStep(
            icon: "star.fill",
            title: "Signal Tasks",
            description: "Add 3-4 Signal tasks each day. These are your high-impact, important tasks that move the needle.",
            highlight: "signal"
        ),
        OnboardingStep(
            icon: "cloud.fill",
            title: "Noise Task",
            description: "Add 1 Noise task for necessary but lower-value work. This keeps your day balanced.",
            highlight: "noise"
        ),
        OnboardingStep(
            icon: "hand.draw.fill",
            title: "Swipe to Add",
            description: "Swipe up and left for Signal tasks, or up and right for Noise. It's quick and intuitive.",
            highlight: nil
        ),
        OnboardingStep(
            icon: "moon.fill",
            title: "Plan Ahead",
            description: "Once you complete all your tasks, you'll enter planning mode. Add tomorrow's tasks - but you can't check them off until the next day.",
            highlight: nil
        ),
        OnboardingStep(
            icon: "pawprint.fill",
            title: "Meet Your Cat",
            description: "Complete tasks to earn XP. Spend XP on food to keep your virtual cat happy. Don't let them go hungry!",
            highlight: nil
        ),
        OnboardingStep(
            icon: "flame.fill",
            title: "Build Streaks",
            description: "Complete your Signal tasks daily to build streaks. Stay consistent and watch your productivity grow.",
            highlight: nil
        )
    ]

    var body: some View {
        VStack(spacing: 0) {
            // Progress dots
            progressDots
                .padding(.top, 60)

            Spacer()

            // Content
            stepContent
                .padding(.horizontal, 32)

            Spacer()

            // Navigation buttons
            navigationButtons
                .padding(.horizontal, 24)
                .padding(.bottom, 40)
        }
        .background(Theme.dustGrey)
    }

    private var progressDots: some View {
        HStack(spacing: 8) {
            ForEach(0..<steps.count, id: \.self) { index in
                Circle()
                    .fill(index == currentStep ? Theme.chestnut : Theme.silver.opacity(0.3))
                    .frame(width: 8, height: 8)
                    .animation(.easeInOut(duration: 0.2), value: currentStep)
            }
        }
    }

    private var stepContent: some View {
        let step = steps[currentStep]

        return VStack(spacing: 24) {
            // Icon
            ZStack {
                Circle()
                    .fill(step.highlight == "signal" ? Theme.chestnut.opacity(0.1) :
                          step.highlight == "noise" ? Theme.taupe.opacity(0.1) :
                          Theme.silver.opacity(0.1))
                    .frame(width: 100, height: 100)

                Image(systemName: step.icon)
                    .font(.system(size: 40))
                    .foregroundColor(step.highlight == "signal" ? Theme.chestnut :
                                   step.highlight == "noise" ? Theme.taupe :
                                   Theme.chestnut)
            }

            // Title
            Text(step.title)
                .font(.title2.weight(.semibold))
                .foregroundColor(Theme.chestnut)
                .multilineTextAlignment(.center)

            // Description
            Text(step.description)
                .font(.body)
                .foregroundColor(Theme.taupe)
                .multilineTextAlignment(.center)
                .lineSpacing(4)
        }
        .transition(.asymmetric(
            insertion: .move(edge: .trailing).combined(with: .opacity),
            removal: .move(edge: .leading).combined(with: .opacity)
        ))
        .id(currentStep)
    }

    private var navigationButtons: some View {
        HStack(spacing: 16) {
            // Back button (hidden on first step)
            if currentStep > 0 {
                Button(action: previousStep) {
                    Text("Back")
                        .font(.body.weight(.medium))
                        .foregroundColor(Theme.taupe)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
            } else {
                Spacer()
                    .frame(maxWidth: .infinity)
            }

            // Next / Get Started button
            Button(action: nextStep) {
                Text(currentStep == steps.count - 1 ? "Get Started" : "Next")
                    .primaryButton()
            }
        }
    }

    private func nextStep() {
        HapticFeedback.light()

        if currentStep < steps.count - 1 {
            withAnimation(.easeInOut(duration: 0.3)) {
                currentStep += 1
            }
        } else {
            // Complete onboarding
            appState.completeOnboarding()
        }
    }

    private func previousStep() {
        HapticFeedback.light()

        if currentStep > 0 {
            withAnimation(.easeInOut(duration: 0.3)) {
                currentStep -= 1
            }
        }
    }
}

struct OnboardingStep {
    let icon: String
    let title: String
    let description: String
    let highlight: String?  // "signal", "noise", or nil
}

#Preview {
    OnboardingView()
        .environmentObject(AppState())
}

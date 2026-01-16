import SwiftUI

struct CatDisplayView: View {
    let mood: MoodState
    var isFeeding: Bool = false
    var feedingFood: FoodType? = nil
    var size: CatSize = .large
    var onFeedingComplete: (() -> Void)? = nil

    @State private var feedingFrame = 0
    @State private var isAnimating = false
    @State private var bounceScale: CGFloat = 1.0

    enum CatSize {
        case small, medium, large

        var dimension: CGFloat {
            switch self {
            case .small: return 80
            case .medium: return 120
            case .large: return 200
            }
        }
    }

    private let feedingFrameCount = 9
    private let animationInterval: TimeInterval = 0.12

    var body: some View {
        ZStack {
            // Cat image based on mood
            catImage
                .resizable()
                .scaledToFit()
                .frame(width: size.dimension, height: size.dimension)
                .scaleEffect(bounceScale)
        }
        .onChange(of: isFeeding) { _, newValue in
            if newValue {
                startFeedingAnimation()
            }
        }
    }

    private var catImage: Image {
        // In a real app, these would be actual image assets
        // For now, we'll use SF Symbols as placeholders
        // You should replace these with actual cat images from Assets
        let imageName = isAnimating ? "cat_eating_\(feedingFrame)" : "cat_\(mood.rawValue)"

        // Try to load from assets, fallback to SF Symbol
        if let _ = UIImage(named: imageName) {
            return Image(imageName)
        }

        // Fallback to SF Symbols for preview
        return Image(systemName: moodSymbol)
    }

    private var moodSymbol: String {
        if isAnimating {
            return "face.smiling"
        }
        switch mood {
        case .dead: return "face.dashed"
        case .sad: return "cloud.rain"
        case .neutral: return "face.smiling"
        case .smiling: return "face.smiling.fill"
        case .loved: return "heart.fill"
        }
    }

    private func startFeedingAnimation() {
        guard !isAnimating else { return }
        isAnimating = true
        feedingFrame = 0

        // Bounce animation
        withAnimation(.easeInOut(duration: 0.2)) {
            bounceScale = 1.1
        }

        // Run through feeding frames
        Timer.scheduledTimer(withTimeInterval: animationInterval, repeats: true) { timer in
            feedingFrame += 1

            if feedingFrame >= feedingFrameCount {
                timer.invalidate()
                isAnimating = false
                feedingFrame = 0

                withAnimation(.easeInOut(duration: 0.2)) {
                    bounceScale = 1.0
                }

                onFeedingComplete?()
            }
        }
    }
}

// MARK: - Cat Face View (Fallback when no images)
struct CatFaceView: View {
    let mood: MoodState
    let size: CGFloat

    var body: some View {
        ZStack {
            // Face circle
            Circle()
                .fill(Theme.chestnut.opacity(0.2))
                .frame(width: size, height: size)

            // Ears
            HStack(spacing: size * 0.4) {
                Triangle()
                    .fill(Theme.chestnut.opacity(0.3))
                    .frame(width: size * 0.25, height: size * 0.3)
                    .rotationEffect(.degrees(-15))

                Triangle()
                    .fill(Theme.chestnut.opacity(0.3))
                    .frame(width: size * 0.25, height: size * 0.3)
                    .rotationEffect(.degrees(15))
            }
            .offset(y: -size * 0.35)

            // Eyes
            HStack(spacing: size * 0.2) {
                CatEyeView(mood: mood, size: size * 0.15)
                CatEyeView(mood: mood, size: size * 0.15)
            }
            .offset(y: -size * 0.05)

            // Nose
            Triangle()
                .fill(Theme.burntRose)
                .frame(width: size * 0.08, height: size * 0.06)
                .rotationEffect(.degrees(180))
                .offset(y: size * 0.1)

            // Mouth expression
            mouthView
                .offset(y: size * 0.2)
        }
    }

    @ViewBuilder
    private var mouthView: some View {
        switch mood {
        case .dead:
            // X mouth for dead
            Text("× ×")
                .font(.system(size: size * 0.1, weight: .bold))
                .foregroundColor(Theme.taupe)
        case .sad:
            // Frown - curved down
            SmilePath(isSmile: false)
                .stroke(Theme.chestnut, lineWidth: 2)
                .frame(width: size * 0.15, height: size * 0.08)
        case .neutral:
            // Straight line
            Rectangle()
                .fill(Theme.chestnut)
                .frame(width: size * 0.1, height: 2)
        case .smiling:
            // Smile - curved up
            SmilePath(isSmile: true)
                .stroke(Theme.chestnut, lineWidth: 2)
                .frame(width: size * 0.15, height: size * 0.08)
        case .loved:
            // Big smile with open mouth
            SmilePath(isSmile: true)
                .stroke(Theme.chestnut, lineWidth: 3)
                .frame(width: size * 0.2, height: size * 0.1)
        }
    }
}

// Simple smile/frown path
struct SmilePath: Shape {
    let isSmile: Bool

    func path(in rect: CGRect) -> Path {
        var path = Path()
        if isSmile {
            // Smile curves upward (like a U)
            path.move(to: CGPoint(x: 0, y: 0))
            path.addQuadCurve(
                to: CGPoint(x: rect.width, y: 0),
                control: CGPoint(x: rect.midX, y: rect.height * 2)
            )
        } else {
            // Frown curves downward (like an upside-down U)
            path.move(to: CGPoint(x: 0, y: rect.height))
            path.addQuadCurve(
                to: CGPoint(x: rect.width, y: rect.height),
                control: CGPoint(x: rect.midX, y: -rect.height)
            )
        }
        return path
    }
}

struct CatEyeView: View {
    let mood: MoodState
    let size: CGFloat

    var body: some View {
        Group {
            switch mood {
            case .dead:
                Text("x")
                    .font(.system(size: size * 0.8, weight: .bold))
                    .foregroundColor(Theme.taupe)
            case .sad:
                Circle()
                    .fill(Theme.chestnut)
                    .frame(width: size, height: size)
                    .overlay(
                        Circle()
                            .fill(Theme.dustGrey)
                            .frame(width: size * 0.3, height: size * 0.3)
                            .offset(y: size * 0.15)
                    )
            case .loved:
                Image(systemName: "heart.fill")
                    .font(.system(size: size * 0.8))
                    .foregroundColor(Theme.burntRose)
            default:
                Circle()
                    .fill(Theme.chestnut)
                    .frame(width: size, height: size)
            }
        }
    }
}

struct Triangle: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.midX, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.minX, y: rect.maxY))
        path.closeSubpath()
        return path
    }
}

struct ArcShape: Shape {
    let startAngle: Angle
    let endAngle: Angle

    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.addArc(
            center: CGPoint(x: rect.midX, y: rect.midY),
            radius: rect.width / 2,
            startAngle: startAngle,
            endAngle: endAngle,
            clockwise: startAngle.degrees < endAngle.degrees
        )
        return path
    }
}

#Preview {
    VStack(spacing: 20) {
        ForEach(MoodState.allCases, id: \.self) { mood in
            HStack {
                CatFaceView(mood: mood, size: 80)
                Text(mood.rawValue)
                    .foregroundColor(Theme.taupe)
            }
        }
    }
    .padding()
    .background(Theme.dustGrey)
}

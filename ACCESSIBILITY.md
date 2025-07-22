# BetIt Accessibility Guide

This guide covers the accessibility features implemented in BetIt and how to test them.

## Accessibility Features Implemented

### 1. Screen Reader Support (VoiceOver/TalkBack)
- **Semantic roles**: Proper `accessibilityRole` for buttons, headers, lists, alerts
- **Descriptive labels**: `accessibilityLabel` for all interactive elements
- **State announcements**: `accessibilityState` for disabled/busy states
- **Context hints**: `accessibilityHint` for additional context

### 2. Dynamic Type Support
- **Font scaling**: All text supports `allowFontScaling={true}`
- **Max scale limit**: `maxFontSizeMultiplier={2}` to prevent UI breaking
- **Responsive typography**: Uses theme system that scales appropriately

### 3. Keyboard Navigation
- **KeyboardAvoidingView**: All forms wrapped with proper keyboard handling
- **Tap outside to dismiss**: `TouchableWithoutFeedback` for form dismissal
- **Return key handling**: Proper `returnKeyType` and `onSubmitEditing`

### 4. Color and Contrast
- **High contrast colors**: Theme uses WCAG AA compliant color combinations
- **Status colors**: Distinct colors for success, error, warning, info states
- **Error indication**: Not just color-based, also includes text and icons

### 5. Touch Targets
- **Minimum 44pt**: All interactive elements meet minimum touch target size
- **Clear focus states**: Visual feedback for focused elements

## Testing with VoiceOver (iOS)

### Enable VoiceOver
1. Settings → Accessibility → VoiceOver → Turn On
2. Or use triple-click home/side button shortcut

### Testing Checklist

#### Groups Screen
- [ ] "My Groups" header is announced properly
- [ ] "Create Group" and "Join Group" buttons have clear labels
- [ ] Group list items announce group name and member count
- [ ] Empty state is announced clearly

#### Join Group Screen
- [ ] Form field labels are read correctly
- [ ] Error messages are announced as alerts
- [ ] Success notifications are heard
- [ ] Back button has descriptive label

#### Bet Details Screen
- [ ] Bet title and status are clear
- [ ] Participant lists are navigable
- [ ] Join buttons announce which side they're for
- [ ] Voting interface is clear and accessible
- [ ] Image picker buttons have descriptive labels

### VoiceOver Navigation Gestures
- **Swipe right**: Next element
- **Swipe left**: Previous element
- **Double tap**: Activate element
- **Two-finger swipe up**: Read all from current position
- **Rotor**: Adjust navigation (headings, links, buttons)

## Testing with TalkBack (Android)

### Enable TalkBack
1. Settings → Accessibility → TalkBack → Turn On
2. Or use volume up + down buttons for 3 seconds

### TalkBack Gestures
- **Swipe right**: Next element
- **Swipe left**: Previous element
- **Double tap**: Activate element
- **Swipe up then right**: First element
- **Explore by touch**: Touch screen to hear elements

## Dynamic Type Testing

### iOS
1. Settings → Display & Brightness → Text Size
2. Test with different text sizes (Small to Largest)
3. Also test with Larger Accessibility Sizes

### Android
1. Settings → Display → Font size
2. Test with different font scales

### What to Check
- [ ] Text remains readable at all sizes
- [ ] UI doesn't break with larger text
- [ ] Buttons remain tappable
- [ ] Important information isn't cut off

## Automated Testing

### Using Flipper (React Native)
```bash
# Install Flipper accessibility plugin
npm install --save-dev react-native-flipper
```

### Accessibility Inspector (iOS Simulator)
1. Xcode → Open Developer Tool → Accessibility Inspector
2. Connect to simulator
3. Run audit to find accessibility issues

### Android Accessibility Scanner
1. Install Google Accessibility Scanner from Play Store
2. Enable in Accessibility settings
3. Use floating action button to scan screens

## Common Issues and Solutions

### Issue: Button not announcing properly
```typescript
// Bad
<TouchableOpacity onPress={handlePress}>
  <Text>Join</Text>
</TouchableOpacity>

// Good
<TouchableOpacity 
  onPress={handlePress}
  accessibilityRole="button"
  accessibilityLabel="Join group"
  accessibilityState={{ disabled: isLoading }}
>
  <Text>Join</Text>
</TouchableOpacity>
```

### Issue: List not navigable
```typescript
// Bad
{items.map(item => <Item key={item.id} />)}

// Good
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  accessibilityRole="list"
  accessibilityLabel="Groups list"
/>
```

### Issue: Error not announced
```typescript
// Bad
{error && <Text style={errorStyle}>{error}</Text>}

// Good
{error && (
  <Text 
    style={errorStyle}
    accessibilityRole="alert"
    accessibilityLabel={`Error: ${error}`}
  >
    {error}
  </Text>
)}
```

## Best Practices

1. **Test early and often** with real assistive technology
2. **Use semantic HTML/native elements** when possible
3. **Provide context** - don't assume users can see the screen
4. **Test with users** who actually use assistive technology
5. **Keep labels concise but descriptive**
6. **Group related content** logically
7. **Ensure error messages are clear** and actionable

## Resources

- [React Native Accessibility Guide](https://reactnative.dev/docs/accessibility)
- [iOS Accessibility Guidelines](https://developer.apple.com/accessibility/ios/)
- [Android Accessibility Guidelines](https://developer.android.com/guide/topics/ui/accessibility)
- [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Inclusive Design Principles](https://inclusivedesignprinciples.org/)

## Testing Schedule

### During Development
- [ ] Test each screen with VoiceOver/TalkBack during development
- [ ] Verify Dynamic Type support on new components
- [ ] Check color contrast ratios for new UI elements

### Before Release
- [ ] Full accessibility audit with Accessibility Inspector
- [ ] Test complete user flows with screen reader enabled
- [ ] Verify keyboard navigation works throughout app
- [ ] Test with maximum text size settings

### Quarterly Reviews
- [ ] User testing with people who use assistive technology
- [ ] Review and update accessibility labels and hints
- [ ] Check for new accessibility features in React Native updates
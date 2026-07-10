import { View, Text } from 'react-native';
import { profileStyles as styles } from './profileStyles';

export function ProfileActivityCard({ activities }: { activities: any[] }) {
  return <View style={styles.card}><Text style={styles.cardTitle}>Account Activity</Text>{activities.length ? <View style={styles.timeline}>{activities.map((activity) => <ActivityItem key={activity.id} activity={activity} />)}</View> : <Text style={styles.emptyActivityText}>No recent activity logged.</Text>}</View>;
}

function ActivityItem({ activity }: { activity: any }) {
  const date = new Date(activity.timestamp);
  const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  return <View style={styles.timelineItem}><View style={styles.timelineDot} /><View style={styles.timelineContent}><Text style={styles.timelineDesc}>{activity.description}</Text><Text style={styles.timelineTime}>{formattedDate}</Text></View></View>;
}

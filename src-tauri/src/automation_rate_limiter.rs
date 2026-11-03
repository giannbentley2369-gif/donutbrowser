#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize)]
pub struct AutomationQuota {
  /// 0 means unlimited.
  pub limit: u64,
  pub used: u64,
  pub resets_in_secs: Option<u64>,
}

pub async fn automation_quota() -> Option<AutomationQuota> {
  Some(AutomationQuota {
    limit: 0,
    used: 0,
    resets_in_secs: None,
  })
}

#[cfg(test)]
mod tests {
  use super::*;

  #[tokio::test]
  async fn local_automation_quota_is_always_unlimited() {
    let unlimited = Some(AutomationQuota {
      limit: 0,
      used: 0,
      resets_in_secs: None,
    });
    assert_eq!(automation_quota().await, unlimited);
    assert_eq!(automation_quota().await, unlimited);
  }
}
